import { api } from './client'

export interface Transaction {
  id: number
  type: 'income' | 'expense'
  category: string
  amount: number
  partnerId: number | null
  partnerName?: string
  orderId: number | null
  account: string | null
  remark: string | null
  createdAt: string
}

export interface Receivable {
  partnerId: number
  partnerName: string
  orderNo: string
  amount: number
  dueDate: string
  overdue: number
}

export const financeApi = {
  receivables() {
    return api.get<{ data: Receivable[] }>('/api/finance/receivables')
  },
  payables() {
    return api.get<{ data: Receivable[] }>('/api/finance/payables')
  },
  transactions(params?: { type?: string; startDate?: string; endDate?: string }) {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.startDate) qs.set('startDate', params.startDate)
    if (params?.endDate) qs.set('endDate', params.endDate)
    const query = qs.toString()
    return api.get<{ data: Transaction[] }>(`/api/finance/transactions${query ? '?' + query : ''}`)
  },
  createTransaction(data: Partial<Transaction>) {
    return api.post<{ message: string }>('/api/finance/transaction', data)
  }
}
