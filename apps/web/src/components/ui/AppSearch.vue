<template>
  <div class="relative">
    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] pointer-events-none">
      <Search class="h-4 w-4" />
    </div>
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :class="cn(
        'flex h-11 w-full rounded-xl border border-[var(--color-input)] bg-[var(--color-background)] pl-10 pr-10 py-2 text-sm text-[var(--color-foreground)] shadow-sm transition-all placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-[var(--color-brand)]',
        props.class
      )"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keyup.enter="$emit('search', modelValue)"
    />
    <button
      v-if="modelValue"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
      @click="clear"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  placeholder?: string
  class?: string
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
}>()

function clear() {
  emit('update:modelValue', '')
  emit('search', '')
}
</script>
