import { api } from './client'

export interface DashboardStats {
  todaySales: number
  todayPurchases: number
  warningCount: number
  receivableAmount: number
  payableAmount: number
  totalProducts: number
  totalPartners: number
}

export interface SalesTrend {
  date: string
  sales: number
  orders: number
}

export interface ProfitReport {
  totalSales: number
  totalCost: number
  grossProfit: number
  margin: number
  byCategory: Array<{ category: string; sales: number; cost: number; profit: number }>
}

export const reportApi = {
  dashboard() {
    return api.get<{ data: DashboardStats }>('/api/reports/dashboard')
  },
  sales(range?: string) {
    const qs = new URLSearchParams()
    if (range) qs.set('range', range)
    const query = qs.toString()
    return api.get<{ data: SalesTrend[] }>(`/api/reports/sales${query ? '?' + query : ''}`)
  },
  profit() {
    return api.get<{ data: ProfitReport }>('/api/reports/profit')
  },
  inventory() {
    return api.get<{ data: { totalSku: number; totalValue: number; warningCount: number; zeroStockCount: number } }>('/api/reports/inventory')
  }
}
