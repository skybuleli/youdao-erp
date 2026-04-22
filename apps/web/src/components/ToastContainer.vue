<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast-item"
          :class="toast.type"
          @click="toastStore.remove(toast.id)"
        >
          <span class="toast-icon">{{ iconMap[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const iconMap: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
  max-width: 90vw;
  width: fit-content;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  pointer-events: auto;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  min-width: 200px;
  backdrop-filter: blur(12px);
}

.toast-item.success {
  border-color: rgba(16, 185, 129, 0.4);
  color: var(--color-success);
}

.toast-item.error {
  border-color: rgba(239, 68, 68, 0.4);
  color: var(--color-danger);
}

.toast-item.warning {
  border-color: rgba(245, 158, 11, 0.4);
  color: var(--color-warning);
}

.toast-item.info {
  border-color: rgba(59, 130, 246, 0.4);
  color: var(--color-info);
}

.toast-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1.5px solid currentColor;
}

.toast-message {
  line-height: 1.4;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
