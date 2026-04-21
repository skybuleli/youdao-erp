import { api } from './client'

export interface Product {
  id: number
  barcode: string | null
  name: string
  categoryId: number | null
  supplierId: number | null
  supplierName?: string
  specs: string | null
  unit: string
  purchasePrice: number
  salePrice: number
  stockQty: number
  minStock: number
  maxStock: number
  imageUrl: string | null
  status: number
  createdAt: string
}

export interface ProductListRes {
  data: Product[]
  total: number
  page: number
  pageSize: number
}

export interface CreateProductReq {
  barcode?: string
  name: string
  categoryId?: number
  supplierId?: number
  specs?: string
  unit: string
  purchasePrice?: number
  salePrice?: number
  minStock?: number
  maxStock?: number
}

export const productApi = {
  list(params?: { search?: string; category?: string; supplier?: string; page?: number; pageSize?: number }) {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.category) qs.set('category', params.category)
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    const query = qs.toString()
    return api.get<ProductListRes>(`/api/products${query ? '?' + query : ''}`)
  },
  get(id: number) {
    return api.get<{ data: Product }>(`/api/products/${id}`)
  },
  create(data: CreateProductReq) {
    return api.post<{ data: Product; message: string }>('/api/products', data)
  },
  update(id: number, data: Partial<CreateProductReq>) {
    return api.put<{ data: Product; message: string }>(`/api/products/${id}`, data)
  },
  delete(id: number) {
    return api.delete<{ message: string }>(`/api/products/${id}`)
  }
}
