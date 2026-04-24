<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
        @click="$emit('close')"
      />
    </Transition>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="open"
        class="fixed bottom-0 left-0 right-0 z-[301] flex justify-center"
      >
        <div
          class="bg-[var(--color-card)] border border-[var(--color-border)] rounded-t-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
          :class="$props.class"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  open: boolean
  class?: string
}

defineProps<Props>()
defineEmits<{
  close: []
}>()
</script>
