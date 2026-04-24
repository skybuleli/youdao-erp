<template>
  <div class="relative">
    <div v-if="prefixIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] pointer-events-none">
      <component :is="prefixIcon" class="h-4 w-4" />
    </div>
    <input
      v-model="modelValue"
      :class="cn(
        'flex h-10 w-full rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm transition-colors placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        prefixIcon && 'pl-10',
        suffixIcon && 'pr-10',
        $props.class
      )"
      v-bind="$attrs"
    />
    <div v-if="suffixIcon" class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] pointer-events-none">
      <component :is="suffixIcon" class="h-4 w-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { Component } from 'vue'

interface Props {
  class?: string
  prefixIcon?: Component
  suffixIcon?: Component
}

defineProps<Props>()

const modelValue = defineModel<string | number>()
</script>
