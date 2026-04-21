import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<'dark' | 'light'>('dark')

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', currentTheme.value)
    localStorage.setItem('theme', currentTheme.value)
  }

  function initTheme() {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved) {
      currentTheme.value = saved
    }
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }

  return { currentTheme, toggleTheme, initTheme }
})
