import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'manager', 'staff'] }).notNull().default('staff'),
  phone: text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const categories = sqliteTable('categories', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').default(0)
})

export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  barcode: text('barcode').unique(),
  name: text('name').notNull(),
  categoryId: integer('category_id'),
  specs: text('specs'),
  unit: text('unit').notNull(),
  purchasePrice: real('purchase_price').default(0),
  salePrice: real('sale_price').default(0),
  stockQty: real('stock_qty').default(0),
  minStock: real('min_stock').default(0),
  maxStock: real('max_stock').default(999999),
  imageUrl: text('image_url'),
  status: integer('status').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const partners = sqliteTable('partners', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['supplier', 'customer'] }).notNull(),
  name: text('name').notNull(),
  contact: text('contact'),
  phone: text('phone'),
  address: text('address'),
  balance: real('balance').default(0),
  remark: text('remark'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const warehouses = sqliteTable('warehouses', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address'),
  managerId: integer('manager_id')
})

export const orders = sqliteTable('orders', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderNo: text('order_no').notNull().unique(),
  type: text('type', { enum: ['purchase', 'sale'] }).notNull(),
  subType: text('sub_type'),
  partnerId: integer('partner_id').notNull(),
  warehouseId: integer('warehouse_id'),
  totalAmount: real('total_amount').default(0),
  discountAmount: real('discount_amount').default(0),
  payableAmount: real('payable_amount').default(0),
  paidAmount: real('paid_amount').default(0),
  status: text('status').default('pending'),
  orderDate: integer('order_date', { mode: 'timestamp' }),
  remark: text('remark'),
  createdBy: integer('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull(),
  productId: integer('product_id').notNull(),
  qty: real('qty').notNull(),
  unitPrice: real('unit_price').notNull(),
  amount: real('amount').notNull(),
  remark: text('remark')
})

export const inventoryLogs = sqliteTable('inventory_logs', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull(),
  warehouseId: integer('warehouse_id'),
  type: text('type').notNull(),
  qty: real('qty').notNull(),
  beforeQty: real('before_qty'),
  afterQty: real('after_qty'),
  refType: text('ref_type'),
  refId: integer('ref_id'),
  createdBy: integer('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const transactions = sqliteTable('transactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  category: text('category').notNull(),
  amount: real('amount').notNull(),
  partnerId: integer('partner_id'),
  orderId: integer('order_id'),
  account: text('account'),
  remark: text('remark'),
  createdBy: integer('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})
