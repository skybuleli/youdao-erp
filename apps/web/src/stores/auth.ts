import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api'

interface User {
  id: number
  username: string
  name: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref(localStorage.getItem('token') || '')
  const loading = ref(false)

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const res = await authApi.login({ username, password })
      user.value = res.user
      token.value = res.token
      localStorage.setItem('token', res.token)
      return true
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      user.value = res.data
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return { user, token, loading, login, fetchMe, logout }
})
