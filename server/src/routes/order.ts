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
  const prefix = type === 'purchase' ? 'CG' : type === 'sale' ? 'XS' : 'TH'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 9000 + 1000)
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

// POST /api/orders — 创建（含库存联动，事务保护）
orderRouter.post('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const body = await c.req.json()
  const result = orderSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.format() }, 400)
  }

  const data = result.data

  // 计算总金额
  const totalAmount = data.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const payableAmount = totalAmount - data.discountAmount

  // 生成订单号（带重试）
  let orderNo = generateOrderNo(data.subType === 'return' ? 'return' : data.type)
  let retryCount = 0
  const maxRetries = 3

  while (retryCount < maxRetries) {
    const existing = await db.select().from(schema.orders).where(eq(schema.orders.orderNo, orderNo)).get()
    if (!existing) break
    orderNo = generateOrderNo(data.subType === 'return' ? 'return' : data.type)
    retryCount++
  }

  try {
    // 使用事务包裹所有数据库操作
    const order = await db.transaction(async (tx) => {
      // 1. 销售单/退货单：检查并扣减/恢复库存
      if (data.type === 'sale') {
        for (const item of data.items) {
          const product = await tx.select().from(schema.products)
            .where(eq(schema.products.id, item.productId))
            .get()

          if (!product) {
            throw new Error(`商品 ${item.productId} 不存在`)
          }

          const stockQty = product.stockQty ?? 0

          // 退货单：恢复库存；销售单：扣减库存
          if (data.subType === 'return') {
            // 退货不检查库存，直接恢复
          } else {
            if (stockQty < item.qty) {
              throw new Error(`库存不足: ${product.name} (库存 ${stockQty}, 需要 ${item.qty})`)
            }
          }
        }
      }

      // 2. 采购单：验证商品必须属于所选供应商
      if (data.type === 'purchase') {
        for (const item of data.items) {
          const product = await tx.select().from(schema.products)
            .where(eq(schema.products.id, item.productId))
            .get()
          if (!product) {
            throw new Error(`商品 ${item.productId} 不存在`)
          }
          if (product.supplierId !== data.partnerId) {
            throw new Error(`商品「${product.name}」不属于所选供应商，无法采购`)
          }
        }
      }

      // 3. 创建订单
      const [newOrder] = await tx.insert(schema.orders).values({
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

      const orderId = newOrder.id

      // 4. 插入订单项
      for (const item of data.items) {
        await tx.insert(schema.orderItems).values({
          orderId,
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          amount: item.qty * item.unitPrice
        })
      }

      // 5. 库存变动（事务内）
      if (data.type === 'sale') {
        for (const item of data.items) {
          const product = await tx.select().from(schema.products)
            .where(eq(schema.products.id, item.productId))
            .get()

          if (product) {
            const beforeQty = product.stockQty ?? 0
            // 退货单恢复库存，销售单扣减库存
            const afterQty = data.subType === 'return'
              ? beforeQty + item.qty
              : beforeQty - item.qty

            await tx.update(schema.products)
              .set({ stockQty: afterQty })
              .where(eq(schema.products.id, item.productId))

            await tx.insert(schema.inventoryLogs).values({
              productId: item.productId,
              warehouseId: data.warehouseId,
              type: data.subType === 'return' ? 'in' : 'out',
              qty: data.subType === 'return' ? item.qty : -item.qty,
              beforeQty,
              afterQty,
              refType: 'order',
              refId: orderId
            })
          }
        }
      }

      // 6. 财务记录（事务内）
      if (data.paidAmount > 0) {
        await tx.insert(schema.transactions).values({
          type: data.type === 'sale' ? 'income' : 'expense',
          category: data.subType === 'return'
            ? '销售退货'
            : data.type === 'sale'
              ? '销售收入'
              : '采购支出',
          amount: data.paidAmount,
          partnerId: data.partnerId,
          orderId,
          account: data.paymentMethod || 'cash',
          remark: data.remark
        })
      }

      return newOrder
    })

    return c.json({ data: order, message: '订单创建成功' }, 201)
  } catch (err: any) {
    console.error('Order creation failed:', err.message)
    return c.json({ error: err.message || '订单创建失败' }, 400)
  }
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

  try {
    const updatedOrder = await db.transaction(async (tx) => {
      const order = await tx.select().from(schema.orders).where(eq(schema.orders.id, id)).get()
      if (!order) throw new Error('Order not found')

      // 采购单完成时增加库存
      if (order.type === 'purchase' && result.data.status === 'completed' && order.status !== 'completed') {
        const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id))
        for (const item of items) {
          const product = await tx.select().from(schema.products)
            .where(eq(schema.products.id, item.productId))
            .get()
          if (product) {
            const beforeQty = product.stockQty ?? 0
            const afterQty = beforeQty + item.qty
            await tx.update(schema.products)
              .set({ stockQty: afterQty })
              .where(eq(schema.products.id, item.productId))

            await tx.insert(schema.inventoryLogs).values({
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

      const [updated] = await tx.update(schema.orders)
        .set({ status: result.data.status })
        .where(eq(schema.orders.id, id))
        .returning()

      return updated
    })

    return c.json({ data: updatedOrder, message: '订单状态更新成功' })
  } catch (err: any) {
    if (err.message === 'Order not found') return c.json({ error: 'Order not found' }, 404)
    return c.json({ error: err.message || '状态更新失败' }, 500)
  }
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
