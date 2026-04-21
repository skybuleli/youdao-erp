// Shared types between frontend and backend

export interface User {
  id: number
  username: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  phone?: string
  createdAt: string
}

export interface Category {
  id: number
  name: string
  parentId?: number
  sortOrder: number
}

export interface Product {
  id: number
  barcode?: string
  name: string
  categoryId?: number
  specs?: string
  unit: string
  purchasePrice: number
  salePrice: number
  stockQty: number
  minStock: number
  maxStock: number
  imageUrl?: string
  status: number
  createdAt: string
}

export interface Partner {
  id: number
  type: 'supplier' | 'customer'
  name: string
  contact?: string
  phone?: string
  address?: string
  balance: number
  remark?: string
  createdAt: string
}

export interface Order {
  id: number
  orderNo: string
  type: 'purchase' | 'sale'
  subType?: string
  partnerId: number
  warehouseId?: number
  totalAmount: number
  discountAmount: number
  payableAmount: number
  paidAmount: number
  status: string
  orderDate?: string
  remark?: string
  createdBy?: number
  createdAt: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  product?: Product
  qty: number
  unitPrice: number
  amount: number
  remark?: string
}

export interface InventoryLog {
  id: number
  productId: number
  product?: Product
  warehouseId?: number
  type: string
  qty: number
  beforeQty?: number
  afterQty?: number
  refType?: string
  refId?: number
  createdBy?: number
  createdAt: string
}

export interface Transaction {
  id: number
  type: 'income' | 'expense'
  category: string
  amount: number
  partnerId?: number
  partner?: Partner
  orderId?: number
  account?: string
  remark?: string
  createdBy?: number
  createdAt: string
}

export interface DashboardStats {
  todaySales: number
  todayPurchases: number
  warningCount: number
  receivableAmount: number
  payableAmount: number
  totalProducts: number
  totalPartners: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
