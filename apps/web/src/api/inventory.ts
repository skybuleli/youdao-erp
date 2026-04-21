import { api } from './client'

export interface InventoryItem {
  productId: number
  productName: string
  barcode: string | null
  warehouseId: number | null
  warehouseName: string | null
  stockQty: number
  minStock: number
  maxStock: number
  warning: boolean
}

export interface InventoryLog {
  id: number
  productId: number
  productName?: string
  warehouseId: number | null
  type: string
  qty: number
  beforeQty: number | null
  afterQty: number | null
  refType: string | null
  refId: number | null
  createdAt: string
}

export const inventoryApi = {
  list(params?: { search?: string; warning?: boolean }) {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.warning) qs.set('warning', 'true')
    const query = qs.toString()
    return api.get<{ data: InventoryItem[] }>(`/api/inventory${query ? '?' + query : ''}`)
  },
  logs(params?: { productId?: number; type?: string }) {
    const qs = new URLSearchParams()
    if (params?.productId) qs.set('productId', String(params.productId))
    if (params?.type) qs.set('type', params.type)
    const query = qs.toString()
    return api.get<{ data: InventoryLog[] }>(`/api/inventory/logs${query ? '?' + query : ''}`)
  },
  adjust(data: { productId: number; warehouseId?: number; qty: number; type: string; remark?: string }) {
    return api.post<{ message: string }>('/api/inventory/adjust', data)
  }
}
