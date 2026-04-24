<template>
  <div class="relative">
    <select
      v-model="modelValue"
      :class="cn(
        'flex h-10 w-full rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
        $props.class
      )"
      v-bind="$attrs"
    >
      <slot />
    </select>
    <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)] pointer-events-none" />
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

defineProps<Props>()

const modelValue = defineModel<string | number | null>()
</script>
