import { api } from './client'

export interface OrderItem {
  id?: number
  productId: number
  qty: number
  unitPrice: number
  amount?: number
  remark?: string
}

export interface Order {
  id: number
  orderNo: string
  type: 'purchase' | 'sale'
  subType: string | null
  partnerId: number
  warehouseId: number | null
  totalAmount: number
  discountAmount: number
  payableAmount: number
  paidAmount: number
  status: string
  orderDate: string | null
  remark: string | null
  createdAt: string
  items?: OrderItem[]
}

export interface OrderListRes {
  data: Order[]
}

export interface CreateOrderReq {
  type: 'purchase' | 'sale'
  subType?: string
  partnerId: number
  warehouseId?: number
  discountAmount?: number
  paidAmount?: number
  paymentMethod?: string
  remark?: string
  items: Array<{ productId: number; qty: number; unitPrice: number }>
}

export const orderApi = {
  list(params?: { type?: string; status?: string }) {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.status) qs.set('status', params.status)
    const query = qs.toString()
    return api.get<OrderListRes>(`/api/orders${query ? '?' + query : ''}`)
  },
  get(id: number) {
    return api.get<{ data: Order }>(`/api/orders/${id}`)
  },
  create(data: CreateOrderReq) {
    return api.post<{ data: Order; message: string }>('/api/orders', data)
  },
  updateStatus(id: number, status: string) {
    return api.patch<{ data: Order; message: string }>(`/api/orders/${id}/status`, { status })
  },
  delete(id: number) {
    return api.delete<{ message: string }>(`/api/orders/${id}`)
  }
}
