import { Hono } from 'hono'
import { eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../schema'
import type { Env } from '../index'

export const reportRouter = new Hono<{ Bindings: Env }>()

// GET /api/reports/dashboard — 仪表盘统计
reportRouter.get('/dashboard', async (c) => {
  const db = drizzle(c.env.DB, { schema })

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd = todayStart + 86400000

  // 今日销售
  const todaySalesResult = await db.select({
    total: sql<number>`COALESCE(SUM(${schema.orders.totalAmount}), 0)`
  }).from(schema.orders)
    .where(sql`${schema.orders.type} = 'sale' AND ${schema.orders.createdAt} >= ${todayStart} AND ${schema.orders.createdAt} < ${todayEnd}`)

  // 今日采购
  const todayPurchasesResult = await db.select({
    total: sql<number>`COALESCE(SUM(${schema.orders.totalAmount}), 0)`
  }).from(schema.orders)
    .where(sql`${schema.orders.type} = 'purchase' AND ${schema.orders.createdAt} >= ${todayStart} AND ${schema.orders.createdAt} < ${todayEnd}`)

  // 库存预警数量
  const warningResult = await db.select({
    count: sql<number>`COUNT(*)`
  }).from(schema.products)
    .where(sql`${schema.products.stockQty} <= ${schema.products.minStock}`)

  // 应收总额
  const receivableResult = await db.select({
    total: sql<number>`COALESCE(SUM(${schema.orders.payableAmount} - ${schema.orders.paidAmount}), 0)`
  }).from(schema.orders)
    .where(sql`${schema.orders.type} = 'sale' AND ${schema.orders.status} != 'completed'`)

  // 应付总额
  const payableResult = await db.select({
    total: sql<number>`COALESCE(SUM(${schema.orders.payableAmount} - ${schema.orders.paidAmount}), 0)`
  }).from(schema.orders)
    .where(sql`${schema.orders.type} = 'purchase' AND ${schema.orders.status} != 'completed'`)

  // 商品总数
  const productCount = await db.select({ count: sql<number>`COUNT(*)` }).from(schema.products)

  // 往来单位总数
  const partnerCount = await db.select({ count: sql<number>`COUNT(*)` }).from(schema.partners)

  // 供应商总数
  const supplierCount = await db.select({ count: sql<number>`COUNT(*)` })
    .from(schema.partners)
    .where(eq(schema.partners.type, 'supplier'))

  return c.json({
    data: {
      todaySales: todaySalesResult[0]?.total || 0,
      todayPurchases: todayPurchasesResult[0]?.total || 0,
      warningCount: warningResult[0]?.count || 0,
      receivableAmount: receivableResult[0]?.total || 0,
      payableAmount: payableResult[0]?.total || 0,
      totalProducts: productCount[0]?.count || 0,
      totalPartners: partnerCount[0]?.count || 0,
      totalSuppliers: supplierCount[0]?.count || 0
    }
  })
})

// GET /api/reports/sales — 销售趋势
reportRouter.get('/sales', async (c) => {
  const db = drizzle(c.env.DB, { schema })
  const range = c.req.query('range') || 'week'

  const now = new Date()
  let days = 7
  if (range === 'today') days = 1
  else if (range === 'month') days = 30
  else if (range === 'quarter') days = 90

  const startTime = new Date(now.getTime() - days * 86400000).getTime()

  const orders = await db.select().from(schema.orders)
    .where(sql`${schema.orders.type} = 'sale' AND ${schema.orders.createdAt} >= ${startTime}`)
    .orderBy(schema.orders.createdAt)

  // 按日期分组
  const groupMap = new Map<string, { sales: number; orders: number }>()
  for (const o of orders) {
    const date = o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : ''
    if (!date) continue
    const existing = groupMap.get(date) || { sales: 0, orders: 0 }
    existing.sales += o.totalAmount ?? 0
    existing.orders += 1
    groupMap.set(date, existing)
  }

  const data = Array.from(groupMap.entries()).map(([date, val]) => ({
    date,
    sales: val.sales,
    orders: val.orders
  }))

  return c.json({ data })
})

// GET /api/reports/profit — 利润分析
reportRouter.get('/profit', async (c) => {
  const db = drizzle(c.env.DB, { schema })

  // 获取所有销售订单项
  const items = await db.select({
    productId: schema.orderItems.productId,
    qty: schema.orderItems.qty,
    unitPrice: schema.orderItems.unitPrice,
    amount: schema.orderItems.amount
  }).from(schema.orderItems)
    .innerJoin(schema.orders, eq(schema.orders.id, schema.orderItems.orderId))
    .where(eq(schema.orders.type, 'sale'))

  // 获取商品进价
  const productIds = [...new Set(items.map(i => i.productId))]
  const products = productIds.length > 0
    ? await db.select().from(schema.products).where(sql`${schema.products.id} IN ${productIds}`)
    : []
  const productMap = new Map(products.map(p => [p.id, p]))

  let totalSales = 0
  let totalCost = 0
  const categoryMap = new Map<string, { sales: number; cost: number }>()

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) continue
    const cost = (product.purchasePrice ?? 0) * (item.qty ?? 0)
    totalSales += item.amount ?? 0
    totalCost += cost

    // 按分类统计（简化：由于没有 category 名称，先用 product id 分组）
    const catName = String(product.categoryId || '未分类')
    const existing = categoryMap.get(catName) || { sales: 0, cost: 0 }
    existing.sales += item.amount ?? 0
    existing.cost += cost
    categoryMap.set(catName, existing)
  }

  const grossProfit = totalSales - totalCost
  const margin = totalSales > 0 ? Math.round((grossProfit / totalSales) * 1000) / 10 : 0

  return c.json({
    data: {
      totalSales,
      totalCost,
      grossProfit,
      margin,
      byCategory: Array.from(categoryMap.entries()).map(([category, val]) => ({
        category,
        sales: val.sales,
        cost: val.cost,
        profit: val.sales - val.cost
      }))
    }
  })
})

// GET /api/reports/inventory — 库存报表
reportRouter.get('/inventory', async (c) => {
  const db = drizzle(c.env.DB, { schema })

  const rows = await db.select({
    product: schema.products,
    supplierName: schema.partners.name
  })
    .from(schema.products)
    .leftJoin(schema.partners, eq(schema.products.supplierId, schema.partners.id))

  const totalSku = rows.length
  const totalValue = rows.reduce((sum, r) => sum + ((r.product.stockQty ?? 0) * (r.product.purchasePrice ?? 0)), 0)
  const warningCount = rows.filter(r => (r.product.stockQty ?? 0) <= (r.product.minStock ?? 0)).length
  const zeroStockCount = rows.filter(r => (r.product.stockQty ?? 0) === 0).length

  // 按供应商统计
  const supplierMap = new Map<string, { sku: number; value: number }>()
  for (const r of rows) {
    const name = r.supplierName || '未关联供应商'
    const existing = supplierMap.get(name) || { sku: 0, value: 0 }
    existing.sku += 1
    existing.value += (r.product.stockQty ?? 0) * (r.product.purchasePrice ?? 0)
    supplierMap.set(name, existing)
  }

  return c.json({
    data: {
      totalSku,
      totalValue: Math.round(totalValue * 100) / 100,
      warningCount,
      zeroStockCount,
      bySupplier: Array.from(supplierMap.entries()).map(([name, val]) => ({
        supplier: name,
        sku: val.sku,
        value: Math.round(val.value * 100) / 100
      }))
    }
  })
})
