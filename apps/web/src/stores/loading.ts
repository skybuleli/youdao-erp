import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const globalLoading = ref(false)

  function start() {
    globalLoading.value = true
  }

  function stop() {
    globalLoading.value = false
  }

  return { globalLoading, start, stop }
})
