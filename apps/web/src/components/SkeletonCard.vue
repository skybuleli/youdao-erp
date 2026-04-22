<template>
  <div class="skeleton-card" :class="{ inline }">
    <div v-if="showHeader" class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-lines">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>
    <div v-for="i in lines" :key="i" class="skeleton-line" :class="{ short: i % 3 === 0 }"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  lines?: number
  showHeader?: boolean
  inline?: boolean
}>(), {
  lines: 3,
  showHeader: false,
  inline: false
})
</script>

<style scoped>
.skeleton-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-card.inline {
  display: inline-flex;
  width: 100%;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-surface);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  animation: pulse 1.5s ease-in-out infinite;
  width: 100%;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
