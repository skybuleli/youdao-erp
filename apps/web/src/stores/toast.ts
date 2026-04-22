import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

let idCounter = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  function add(message: string, type: ToastType = 'info', duration = 3000) {
    const id = ++idCounter
    toasts.value.push({ id, message, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message: string, duration?: number) {
    add(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    add(message, 'error', duration)
  }

  function warning(message: string, duration?: number) {
    add(message, 'warning', duration)
  }

  function info(message: string, duration?: number) {
    add(message, 'info', duration)
  }

  return { toasts, add, remove, success, error, warning, info }
})
