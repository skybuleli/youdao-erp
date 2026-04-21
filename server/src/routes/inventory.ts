import { Hono } from 'hono'
import { eq, and, desc, sql, like } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import * as schema from '../schema'
import type { Env } from '../index'

export const inventoryRouter = new Hono<{ Bindings: Env }>()

// GET /api/inventory — 库存列表（join partners 获取 supplierName）
inventoryRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const search = c.req.query('search')
  const warning = c.req.query('warning')
  const supplier = c.req.query('supplier')

  const filters = []
  if (search) {
    filters.push(like(schema.products.name, `%${search}%`))
  }
  if (supplier) {
    const supId = Number(supplier)
    if (!isNaN(supId)) {
      filters.push(eq(schema.products.supplierId, supId))
    }
  }

  const conditions = filters.length > 0
    ? (filters.length === 1 ? filters[0] : and(...filters))
    : undefined

  const rows = await db.select({
    product: schema.products,
    supplierName: schema.partners.name
  })
    .from(schema.products)
    .leftJoin(schema.partners, eq(schema.products.supplierId, schema.partners.id))
    .where(conditions)
    .orderBy(desc(schema.products.createdAt))

  const result = rows.map(r => ({
    productId: r.product.id,
    productName: r.product.name,
    barcode: r.product.barcode,
    supplierId: r.product.supplierId,
    supplierName: r.supplierName,
    warehouseId: 1,
    warehouseName: '总仓',
    stockQty: r.product.stockQty ?? 0,
    minStock: r.product.minStock ?? 0,
    maxStock: r.product.maxStock ?? 999999,
    warning: (r.product.stockQty ?? 0) <= (r.product.minStock ?? 0)
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
