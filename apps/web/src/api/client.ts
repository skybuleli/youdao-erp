const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL) || ''

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...options,
    headers
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data.error || data.message || `HTTP ${res.status}`
    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw new Error(msg)
  }

  return data as T
}

export const api = {
  get<T>(path: string) {
    return request<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
  },
  put<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    })
  },
  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' })
  }
}
