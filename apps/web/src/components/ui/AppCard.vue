<template>
  <div
    :class="cn(
      'rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-card-foreground)] shadow-sm transition-all duration-200',
      hoverable && 'hover:shadow-md hover:-translate-y-0.5',
      clickable && 'cursor-pointer',
      props.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  hoverable?: boolean
  clickable?: boolean
}

const props = defineProps<Props>()
</script>
