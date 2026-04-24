<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12 px-5 text-[var(--color-muted-foreground)] text-sm">
    <Loader2 class="h-8 w-8 animate-spin text-[var(--color-brand)]" />
    <span>{{ message || '加载中...' }}</span>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

interface Props {
  message?: string
}

defineProps<Props>()
</script>
