<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12 px-5 text-[var(--color-muted-foreground)] text-sm">
    <AppIcon :name="iconName" class="h-10 w-10 opacity-40" />
    <span>{{ message || '暂无数据' }}</span>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

interface Props {
  icon?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'Package'
})

const iconName = computed(() => props.icon || 'Package')
</script>
