<template>
  <label
    :for="$attrs.for as string"
    class="text-sm font-medium text-[var(--color-foreground)] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    <slot />
    <span v-if="required" class="text-[var(--color-danger)] ml-0.5">*</span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  required?: boolean
}

defineProps<Props>()
</script>
