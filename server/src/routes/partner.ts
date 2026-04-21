import { Hono } from 'hono'
import { eq, like, desc, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import * as schema from '../schema'
import type { Env } from '../index'

const partnerSchema = z.object({
  type: z.enum(['supplier', 'customer']),
  name: z.string().min(1),
  contact: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  remark: z.string().optional()
})

export const partnerRouter = new Hono<{ Bindings: Env }>()

// GET /api/partners — 列表
partnerRouter.get('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const type = c.req.query('type')
  const search = c.req.query('search')

  let conditions = undefined
  if (type && search) {
    conditions = sql`${schema.partners.type} = ${type} AND ${schema.partners.name} LIKE ${`%${search}%`}`
  } else if (type) {
    conditions = sql`${schema.partners.type} = ${type}`
  } else if (search) {
    conditions = like(schema.partners.name, `%${search}%`)
  }

  const items = await db.select().from(schema.partners)
    .where(conditions)
    .orderBy(desc(schema.partners.createdAt))

  return c.json({ data: items })
})

// GET /api/partners/:id — 详情
partnerRouter.get('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const item = await db.select().from(schema.partners).where(eq(schema.partners.id, id)).get()
  if (!item) return c.json({ error: 'Partner not found' }, 404)

  return c.json({ data: item })
})

// POST /api/partners — 创建
partnerRouter.post('/', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const body = await c.req.json()
  const result = partnerSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.format() }, 400)
  }

  const insertResult = await db.insert(schema.partners).values(result.data).returning()
  return c.json({ data: insertResult[0], message: '往来单位创建成功' }, 201)
})

// PUT /api/partners/:id — 更新
partnerRouter.put('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const body = await c.req.json()
  const result = partnerSchema.partial().safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.format() }, 400)
  }

  const updateResult = await db.update(schema.partners)
    .set(result.data)
    .where(eq(schema.partners.id, id))
    .returning()

  if (updateResult.length === 0) return c.json({ error: 'Partner not found' }, 404)

  return c.json({ data: updateResult[0], message: '往来单位更新成功' })
})

// DELETE /api/partners/:id — 删除
partnerRouter.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ error: 'Invalid id' }, 400)

  const deleteResult = await db.delete(schema.partners).where(eq(schema.partners.id, id)).returning()
  if (deleteResult.length === 0) return c.json({ error: 'Partner not found' }, 404)

  return c.json({ message: '往来单位删除成功' })
})
