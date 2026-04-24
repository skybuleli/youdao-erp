<template>
    <span :class="cn(badgeVariants({ variant }), $props.class)">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { badgeVariants } from './index'
import type { BadgeVariants } from './index'

interface Props {
  variant?: BadgeVariants['variant']
  class?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>
