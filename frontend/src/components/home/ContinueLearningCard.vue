<script setup lang="ts">
defineProps<{
  title: string
  lastStudied: string
  buttonText: string
}>()

const emit = defineEmits<{
  (event: 'continue'): void
}>()
</script>

<template>
  <section class="surface-card flex flex-col gap-5 p-6">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <p class="text-sm font-semibold text-slate-900">继续学习</p>
        <h2 class="text-xl font-semibold text-slate-900">{{ title }}</h2>
        <p class="text-sm text-slate-500">上次学习：{{ lastStudied }}</p>
      </div>
      <div class="grid h-12 w-12 place-items-center rounded-2xl bg-warm text-lg text-slate-700">
        续
      </div>
    </div>

    <button
      type="button"
      class="inline-flex w-fit items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#274d84]"
      @click="emit('continue')"
    >
      {{ buttonText }}
    </button>
  </section>
</template>
