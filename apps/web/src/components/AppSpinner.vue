<template>
  <div class="spinner-overlay" v-if="visible">
    <div class="spinner">
      <div class="spinner-ring"></div>
    </div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  text?: string
}>()
</script>

<style scoped>
.spinner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  position: relative;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid var(--border-subtle);
  border-top-color: #7C5CFC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-text {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
