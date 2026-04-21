import { api } from './client'

export interface LoginReq {
  username: string
  password: string
}

export interface LoginRes {
  token: string
  user: {
    id: number
    username: string
    name: string
    role: string
  }
}

export interface UserProfile {
  id: number
  username: string
  name: string
  role: string
  phone?: string
  createdAt?: string
}

export const authApi = {
  login(data: LoginReq) {
    return api.post<LoginRes>('/api/auth/login', data)
  },
  me() {
    return api.get<{ data: UserProfile }>('/api/auth/me')
  }
}
