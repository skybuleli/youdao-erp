import { Hono } from 'hono'
import { eq, desc, sql, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import * as schema from '../schema'
import type { Env } from '../index'

export const financeRouter = new Hono<{ Bindings: Env }>()

// GET /api/finance/transactions — 收支记录
financeRouter.get('/transactions', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const type = c.req.query('type')
  const startDate = c.req.query('startDate')
  const endDate = c.req.query('endDate')

  let conditions = undefined
  if (type && startDate && endDate) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 86400000
    conditions = sql`${schema.transactions.type} = ${type} AND ${schema.transactions.createdAt} >= ${start} AND ${schema.transactions.createdAt} < ${end}`
  } else if (type) {
    conditions = sql`${schema.transactions.type} = ${type}`
  } else if (startDate && endDate) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 86400000
    conditions = sql`${schema.transactions.createdAt} >= ${start} AND ${schema.transactions.createdAt} < ${end}`
  }

  const items = await db.select().from(schema.transactions)
    .where(conditions)
    .orderBy(desc(schema.transactions.createdAt))

  // 获取往来单位名称（修复IN查询语法）
  const partnerIds = [...new Set(items.map(t => t.partnerId).filter((id): id is number => id != null))]
  const partners = partnerIds.length > 0
    ? await db.select().from(schema.partners).where(inArray(schema.partners.id, partnerIds))
    : []
  const partnerMap = new Map(partners.map(p => [p.id, p.name]))

  const result = items.map(t => ({
    ...t,
    partnerName: t.partnerId ? partnerMap.get(t.partnerId) || '' : null
  }))

  return c.json({ data: result })
})

// GET /api/finance/receivables — 应收账款
financeRouter.get('/receivables', async (c) => {
  const db = drizzle(c.env.DB, { schema })

  // 获取未完成的销售单
  const orders = await db.select().from(schema.orders)
    .where(sql`${schema.orders.type} = 'sale' AND ${schema.orders.status} != 'completed'`)
    .orderBy(desc(schema.orders.createdAt))

  const partnerIds = [...new Set(orders.map(o => o.partnerId).filter((id): id is number => id != null))]
  const partners = partnerIds.length > 0
    ? await db.select().from(schema.partners).where(inArray(schema.partners.id, partnerIds))
    : []
  const partnerMap = new Map(partners.map(p => [p.id, p.name]))

  const result = orders.map(o => ({
    orderId: o.id,
    partnerId: o.partnerId,
    partnerName: partnerMap.get(o.partnerId) || '',
    orderNo: o.orderNo,
    amount: (o.payableAmount ?? 0) - (o.paidAmount ?? 0),
    dueDate: o.orderDate ? new Date(o.orderDate).toISOString().slice(0, 10) : '',
    overdue: 0
  })).filter(r => r.amount > 0)

  return c.json({ data: result })
})

// GET /api/finance/payables — 应付账款
financeRouter.get('/payables', async (c) => {
  const db = drizzle(c.env.DB, { schema })

  const orders = await db.select().from(schema.orders)
    .where(sql`${schema.orders.type} = 'purchase' AND ${schema.orders.status} != 'completed'`)
    .orderBy(desc(schema.orders.createdAt))

  const partnerIds = [...new Set(orders.map(o => o.partnerId).filter((id): id is number => id != null))]
  const partners = partnerIds.length > 0
    ? await db.select().from(schema.partners).where(inArray(schema.partners.id, partnerIds))
    : []
  const partnerMap = new Map(partners.map(p => [p.id, p.name]))

  const result = orders.map(o => ({
    orderId: o.id,
    partnerId: o.partnerId,
    partnerName: partnerMap.get(o.partnerId) || '',
    orderNo: o.orderNo,
    amount: (o.payableAmount ?? 0) - (o.paidAmount ?? 0),
    dueDate: o.orderDate ? new Date(o.orderDate).toISOString().slice(0, 10) : '',
    overdue: 0
  })).filter(r => r.amount > 0)

  return c.json({ data: result })
})

// POST /api/finance/transaction — 创建收付款记录（事务保护）
financeRouter.post('/transaction', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const body = await c.req.json()

  const transactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    category: z.string(),
    amount: z.number().positive(),
    partnerId: z.number().optional(),
    orderId: z.number().optional(),
    account: z.string().optional(),
    remark: z.string().optional()
  })

  const result = transactionSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: 'Invalid input', details: result.error.format() }, 400)
  }

  const data = result.data

  try {
    const record = await db.transaction(async (tx) => {
      // 如果关联了订单，原子化更新订单的 paidAmount 和 status
      if (data.orderId) {
        const order = await tx.select().from(schema.orders)
          .where(eq(schema.orders.id, data.orderId))
          .get()
        if (order) {
          const newPaid = (order.paidAmount ?? 0) + data.amount
          const newStatus = newPaid >= (order.payableAmount ?? 0) ? 'completed' : order.status

          await tx.update(schema.orders)
            .set({
              paidAmount: newPaid,
              status: newStatus
            })
            .where(eq(schema.orders.id, data.orderId))
        }
      }

      // 更新往来单位余额
      if (data.partnerId) {
        const partner = await tx.select().from(schema.partners)
          .where(eq(schema.partners.id, data.partnerId))
          .get()
        if (partner) {
          const delta = data.type === 'income' ? -data.amount : data.amount
          await tx.update(schema.partners)
            .set({ balance: (partner.balance ?? 0) + delta })
            .where(eq(schema.partners.id, data.partnerId))
        }
      }

      const [inserted] = await tx.insert(schema.transactions).values(data).returning()
      return inserted
    })

    return c.json({ data: record, message: '记录创建成功' }, 201)
  } catch (err: any) {
    console.error('Transaction creation failed:', err.message)
    return c.json({ error: err.message || '记录创建失败' }, 500)
  }
})
