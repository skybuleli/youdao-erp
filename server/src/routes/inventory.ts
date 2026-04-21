import { Hono } from 'hono'
import { eq, desc, sql, like } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import * as schema from '../schema'
import type { Env } from '../index'

export const inventoryRouter = new Hono<{ Bindings: Env }>()

// GET /api/inventory — 库存列表
inventoryRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const search = c.req.query('search')
  const warning = c.req.query('warning')

  let conditions = undefined
  if (search) {
    conditions = like(schema.products.name, `%${search}%`)
  }

  const items = await db.select().from(schema.products)
    .where(conditions)
    .orderBy(desc(schema.products.createdAt))

  const result = items.map(p => ({
    productId: p.id,
    productName: p.name,
    barcode: p.barcode,
    warehouseId: 1,
    warehouseName: '总仓',
    stockQty: p.stockQty ?? 0,
    minStock: p.minStock ?? 0,
    maxStock: p.maxStock ?? 999999,
    warning: (p.stockQty ?? 0) <= (p.minStock ?? 0)
  }))

  if (warning === 'true') {
    return c.json({ data: result.filter(r => r.warning) })
  }

  return c.json({ data: result })
})

// GET /api/inventory/logs — 出入库记录
inventoryRouter.get('/logs', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const productId = c.req.query('productId')

  let conditions = undefined
  if (productId) {
    conditions = eq(schema.inventoryLogs.productId, Number(productId))
  }

  const logs = await db.select().from(schema.inventoryLogs)
    .where(conditions)
    .orderBy(desc(schema.inventoryLogs.createdAt))

  // 获取商品名称
  const productIds = [...new Set(logs.map(l => l.productId))]
  const products = await db.select().from(schema.products)
    .where(sql`${schema.products.id} IN ${productIds}`)

  const productMap = new Map(products.map(p => [p.id, p.name]))

  const result = logs.map(l => ({
    ...l,
    productName: productMap.get(l.productId) || ''
  }))

  return c.json({ data: result })
})

// POST /api/inventory/adjust — 库存调整
inventoryRouter.post('/adjust', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const body = await c.req.json()

  const adjustSchema = z.object({
    productId: z.number(),
    warehouseId: z.number().optional(),
    qty: z.number(), // 正数增加，负数减少
    type: z.string(),
    remark: z.string().optional()
  })

  const result = adjustSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input' }, 400)
  }

  const data = result.data

  const product = await db.select().from(schema.products)
    .where(eq(schema.products.id, data.productId))
    .get()

  if (!product) {
    return c.json({ error: 'Product not found' }, 404)
  }

  const beforeQty = product.stockQty ?? 0
  const afterQty = beforeQty + data.qty

  if (afterQty < 0) {
    return c.json({ error: '库存不足，无法调整' }, 400)
  }

  await db.update(schema.products)
    .set({ stockQty: afterQty })
    .where(eq(schema.products.id, data.productId))

  await db.insert(schema.inventoryLogs).values({
    productId: data.productId,
    warehouseId: data.warehouseId,
    type: data.type,
    qty: data.qty,
    beforeQty,
    afterQty,
    refType: 'adjust'
  })

  return c.json({ message: '库存调整成功', data: { beforeQty, afterQty } })
})
