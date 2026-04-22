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
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  transition: background-color 0.3s, color 0.3s;
}
</style>
