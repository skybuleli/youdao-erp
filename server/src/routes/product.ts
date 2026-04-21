import { Hono } from 'hono'
import { eq, like, and, desc, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import * as schema from '../schema'
import type { Env } from '../index'

const productSchema = z.object({
  barcode: z.string().optional(),
  name: z.string().min(1),
  categoryId: z.number().optional(),
  specs: z.string().optional(),
  unit: z.string().min(1),
  purchasePrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional()
})

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional()
})

export const productRouter = new Hono<{ Bindings: Env }>()

// GET /api/products — 列表
productRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const query = querySchema.safeParse(c.req.query())
  if (!query.success) {
    return c.json({ error: 'Invalid query parameters' }, 400)
  }

  const { search, category, page, pageSize } = query.data
  const pageNum = Math.max(1, Number(page || 1))
  const limit = Math.min(100, Math.max(1, Number(pageSize || 20)))
  const offset = (pageNum - 1) * limit

  let conditions = undefined
  const filters = []
  if (search) {
    filters.push(like(schema.products.name, `%${search}%`))
  }
  if (category) {
    const catId = Number(category)
    if (!isNaN(catId)) {
      filters.push(eq(schema.products.categoryId, catId))
    }
  }
  if (filters.length > 0) {
    conditions = filters.length === 1 ? filters[0] : and(...filters)
  }

  const items = await db.select().from(schema.products)
    .where(conditions)
    .orderBy(desc(schema.products.createdAt))
    .limit(limit)
    .offset(offset)

  const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.products).where(conditions)
  const total = countResult[0]?.count || 0

  return c.json({
    data: items,
    total,
    page: pageNum,
    pageSize: limit
  })
})

// GET /api/products/:id — 详情
productRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const item = await db.select().from(schema.products).where(eq(schema.products.id, id)).get()
  if (!item) return c.json({ error: 'Product not found' }, 404)

  return c.json({ data: item })
})

// POST /api/products — 创建
productRouter.post('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const body = await c.req.json()
  const result = productSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.format() }, 400)
  }

  const insertResult = await db.insert(schema.products).values(result.data).returning()
  return c.json({ data: insertResult[0], message: '商品创建成功' }, 201)
})

// PUT /api/products/:id — 更新
productRouter.put('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const body = await c.req.json()
  const result = productSchema.partial().safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.format() }, 400)
  }

  const updateResult = await db.update(schema.products)
    .set(result.data)
    .where(eq(schema.products.id, id))
    .returning()

  if (updateResult.length === 0) return c.json({ error: 'Product not found' }, 404)

  return c.json({ data: updateResult[0], message: '商品更新成功' })
})

// DELETE /api/products/:id — 删除
productRouter.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const deleteResult = await db.delete(schema.products).where(eq(schema.products.id, id)).returning()
  if (deleteResult.length === 0) return c.json({ error: 'Product not found' }, 404)

  return c.json({ message: '商品删除成功' })
})
