import { Hono } from 'hono'
import { eq, desc, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import * as schema from '../schema'
import type { Env } from '../index'

const orderItemSchema = z.object({
  productId: z.number(),
  qty: z.number().positive(),
  unitPrice: z.number().positive()
})

const orderSchema = z.object({
  type: z.enum(['purchase', 'sale']),
  subType: z.string().optional(),
  partnerId: z.number(),
  warehouseId: z.number().optional(),
  discountAmount: z.number().min(0).default(0),
  paidAmount: z.number().min(0).default(0),
  paymentMethod: z.string().optional(),
  remark: z.string().optional(),
  items: z.array(orderItemSchema).min(1)
})

// 生成订单号
function generateOrderNo(type: string): string {
  const prefix = type === 'purchase' ? 'CG' : 'XS'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 900 + 100)
  return `${prefix}${date}${random}`
}

export const orderRouter = new Hono<{ Bindings: Env }>()

// GET /api/orders — 列表
orderRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const type = c.req.query('type')
  const status = c.req.query('status')

  let conditions = undefined
  if (type && status) {
    conditions = sql`${schema.orders.type} = ${type} AND ${schema.orders.status} = ${status}`
  } else if (type) {
    conditions = sql`${schema.orders.type} = ${type}`
  } else if (status) {
    conditions = sql`${schema.orders.status} = ${status}`
  }

  const items = await db.select().from(schema.orders)
    .where(conditions)
    .orderBy(desc(schema.orders.createdAt))

  return c.json({ data: items })
})

// GET /api/orders/:id — 详情
orderRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).get()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id))

  return c.json({ data: { ...order, items } })
})

// POST /api/orders — 创建（含库存联动）
orderRouter.post('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const body = await c.req.json()
  const result = orderSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.format() }, 400)
  }

  const data = result.data
  const orderNo = generateOrderNo(data.type)

  // 计算总金额
  const totalAmount = data.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const payableAmount = totalAmount - data.discountAmount

  // 如果是销售单，检查库存
  if (data.type === 'sale') {
    for (const item of data.items) {
      const product = await db.select().from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .get()
      if (!product) {
        return c.json({ error: `Product ${item.productId} not found` }, 400)
      }
      const stockQty = product.stockQty ?? 0
      if (stockQty < item.qty) {
        return c.json({ error: `库存不足: ${product.name} (库存 ${stockQty}, 需要 ${item.qty})` }, 400)
      }
    }
  }

  // 创建订单 + 订单项 + 库存变动（事务）
  const order = await db.insert(schema.orders).values({
    orderNo,
    type: data.type,
    subType: data.subType,
    partnerId: data.partnerId,
    warehouseId: data.warehouseId,
    totalAmount,
    discountAmount: data.discountAmount,
    payableAmount,
    paidAmount: data.paidAmount,
    status: data.paidAmount >= payableAmount ? 'completed' : 'pending',
    remark: data.remark
  }).returning()

  const orderId = order[0].id

  // 插入订单项
  for (const item of data.items) {
    await db.insert(schema.orderItems).values({
      orderId,
      productId: item.productId,
      qty: item.qty,
      unitPrice: item.unitPrice,
      amount: item.qty * item.unitPrice
    })
  }

  // 销售单立即扣减库存
  if (data.type === 'sale') {
    for (const item of data.items) {
      const product = await db.select().from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .get()
      if (product) {
        const beforeQty = product.stockQty ?? 0
        const afterQty = beforeQty - item.qty
        await db.update(schema.products)
          .set({ stockQty: afterQty })
          .where(eq(schema.products.id, item.productId))

        await db.insert(schema.inventoryLogs).values({
          productId: item.productId,
          warehouseId: data.warehouseId,
          type: 'out',
          qty: -item.qty,
          beforeQty,
          afterQty,
          refType: 'order',
          refId: orderId
        })
      }
    }
  }

  // 如果已付款，创建财务记录
  if (data.paidAmount > 0) {
    await db.insert(schema.transactions).values({
      type: data.type === 'sale' ? 'income' : 'expense',
      category: data.type === 'sale' ? '销售收入' : '采购支出',
      amount: data.paidAmount,
      partnerId: data.partnerId,
      orderId,
      account: data.paymentMethod || 'cash',
      remark: data.remark
    })
  }

  return c.json({ data: order[0], message: '订单创建成功' }, 201)
})

// PATCH /api/orders/:id/status — 更新状态
orderRouter.patch('/:id/status', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const body = await c.req.json()
  const statusSchema = z.object({ status: z.enum(['pending', 'partial', 'completed', 'cancelled']) })
  const result = statusSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).get()
  if (!order) return c.json({ error: 'Order not found' }, 404)

  // 采购单完成时增加库存
  if (order.type === 'purchase' && result.data.status === 'completed' && order.status !== 'completed') {
    const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id))
    for (const item of items) {
      const product = await db.select().from(schema.products)
        .where(eq(schema.products.id, item.productId))
        .get()
      if (product) {
        const beforeQty = product.stockQty ?? 0
        const afterQty = beforeQty + item.qty
        await db.update(schema.products)
          .set({ stockQty: afterQty })
          .where(eq(schema.products.id, item.productId))

        await db.insert(schema.inventoryLogs).values({
          productId: item.productId,
          warehouseId: order.warehouseId,
          type: 'in',
          qty: item.qty,
          beforeQty,
          afterQty,
          refType: 'order',
          refId: id
        })
      }
    }
  }

  const updateResult = await db.update(schema.orders)
    .set({ status: result.data.status })
    .where(eq(schema.orders.id, id))
    .returning()

  return c.json({ data: updateResult[0], message: '订单状态更新成功' })
})

// DELETE /api/orders/:id — 删除
orderRouter.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).get()
  if (!order) return c.json({ error: 'Order not found' }, 404)
  if (order.status === 'completed') {
    return c.json({ error: '已完成的订单不能删除' }, 400)
  }

  await db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, id))
  await db.delete(schema.orders).where(eq(schema.orders.id, id))

  return c.json({ message: '订单删除成功' })
})
