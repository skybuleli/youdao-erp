<template>
  <div id="app" :data-theme="themeStore.currentTheme">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from './stores/theme'
import ToastContainer from './components/ToastContainer.vue'

const themeStore = useThemeStore()
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  transition: background-color 0.3s ease, color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
