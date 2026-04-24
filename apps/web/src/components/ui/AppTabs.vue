<template>
  <div         :class="cn('w-full', $props.class)">
    <div class="flex gap-1 p-1 bg-[var(--color-secondary)] rounded-xl">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="cn(
          'flex-1 h-9 text-sm font-medium rounded-lg transition-all duration-200',
          modelValue === tab.value
            ? 'bg-[var(--color-brand)] text-[var(--color-brand-foreground)] shadow-sm'
            : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)]'
        )"
        @click="$emit('update:modelValue', tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="ml-1 text-xs opacity-80">({{ tab.count }})</span>
      </button>
    </div>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Tab {
  value: string
  label: string
  count?: number
}

interface Props {
  tabs: Tab[]
  modelValue: string
  class?: string
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
