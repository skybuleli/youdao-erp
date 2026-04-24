<template>
  <div class="flex flex-col gap-1.5">
    <AppLabel v-if="label" :for="inputId" :required="required">{{ label }}</AppLabel>
    <slot />
    <p v-if="hint" class="text-xs text-[var(--color-muted-foreground)]">{{ hint }}</p>
    <p v-if="error" class="text-xs text-[var(--color-danger)]">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import AppLabel from './AppLabel.vue'

interface Props {
  label?: string
  required?: boolean
  hint?: string
  error?: string
  inputId?: string
}

defineProps<Props>()
</script>
