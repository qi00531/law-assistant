<script setup lang="ts">
defineProps<{
  title: string
  summary: string
}>()

const emit = defineEmits<{
  (event: 'start-review'): void
}>()
</script>

<template>
  <div class="rounded-[24px] border border-emerald-200 bg-emerald-50/80 px-4 py-4">
    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Review Match</p>
    <p class="mt-2 text-sm font-semibold text-slate-900">这个知识点你已经保存过：{{ title }}</p>
    <p class="mt-2 text-sm leading-7 text-slate-600">{{ summary }}</p>
    <button
      type="button"
      class="mt-4 inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      @click="emit('start-review')"
    >
      进入复习
    </button>
  </div>
</template>
