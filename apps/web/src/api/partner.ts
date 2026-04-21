import { api } from './client'

export interface Partner {
  id: number
  type: 'supplier' | 'customer'
  name: string
  contact: string | null
  phone: string | null
  address: string | null
  balance: number
  remark: string | null
  createdAt: string
}

export interface PartnerListRes {
  data: Partner[]
}

export interface CreatePartnerReq {
  type: 'supplier' | 'customer'
  name: string
  contact?: string
  phone?: string
  address?: string
  remark?: string
}

export const partnerApi = {
  list(params?: { type?: string; search?: string }) {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return api.get<PartnerListRes>(`/api/partners${query ? '?' + query : ''}`)
  },
  get(id: number) {
    return api.get<{ data: Partner }>(`/api/partners/${id}`)
  },
  create(data: CreatePartnerReq) {
    return api.post<{ data: Partner; message: string }>('/api/partners', data)
  },
  update(id: number, data: Partial<CreatePartnerReq>) {
    return api.put<{ data: Partner; message: string }>(`/api/partners/${id}`, data)
  },
  delete(id: number) {
    return api.delete<{ message: string }>(`/api/partners/${id}`)
  }
}
