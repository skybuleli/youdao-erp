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
          <component :is="iconMap[toast.type]" class="toast-icon" />
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { Check, X, AlertTriangle, Info } from 'lucide-vue-next'

const toastStore = useToastStore()

const iconMap: Record<string, any> = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info
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
  background: var(--color-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  min-width: 200px;
  backdrop-filter: blur(12px);
}

.toast-item.success {
  border-color: rgba(34, 197, 94, 0.4);
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
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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
