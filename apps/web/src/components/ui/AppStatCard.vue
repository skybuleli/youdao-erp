<template>
  <AppCard :class="cn('p-5 flex items-center gap-4', props.class)" hoverable>
    <div
      class="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
      :style="{ background: iconBg, color: iconColor }"
    >
      <slot name="icon" />
    </div>
    <div class="flex flex-col gap-0.5 min-w-0">
      <span class="text-xs font-medium text-[var(--color-muted-foreground)]">{{ label }}</span>
      <span class="text-xl font-bold font-[var(--font-mono)] truncate" :style="valueStyle">{{ value }}</span>
      <span v-if="hint" class="text-xs" :class="hintClass">{{ hint }}</span>
    </div>
  </AppCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import AppCard from './AppCard.vue'

interface Props {
  label: string
  value: string | number
  hint?: string
  hintType?: 'positive' | 'negative' | 'warning' | 'neutral'
  iconBg?: string
  iconColor?: string
  valueColor?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  hintType: 'neutral',
})

const valueStyle = computed(() => {
  if (props.valueColor) return { color: props.valueColor }
  return {}
})

const hintClass = computed(() => {
  switch (props.hintType) {
    case 'positive': return 'text-[var(--color-success)]'
    case 'negative': return 'text-[var(--color-danger)]'
    case 'warning': return 'text-[var(--color-warning)]'
    default: return 'text-[var(--color-muted-foreground)]'
  }
})
</script>
