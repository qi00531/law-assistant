<script setup lang="ts">
import type { InsightOverviewItem } from '../../data/mockInsightsData'

defineProps<{
  items: InsightOverviewItem[]
  activeKey: string
}>()

const emit = defineEmits<{
  (event: 'select', key: string): void
}>()
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <button
      v-for="item in items"
      :key="item.label"
      type="button"
      class="surface-card relative overflow-hidden p-5 text-left transition"
      :class="
        item.label === activeKey
          ? 'border-brand bg-brandSoft/40 shadow-[0_16px_36px_rgba(43,90,156,0.12)]'
          : 'bg-gradient-to-br from-white via-[#fdfbf8] to-[#f8f3eb] hover:-translate-y-0.5 hover:border-slate-300'
      "
      @click="emit('select', item.label)"
    >
      <div class="absolute -right-6 top-0 h-24 w-24 rounded-full bg-[#f3e8d7]/60 blur-2xl" />
      <div class="relative space-y-3">
        <p class="text-sm font-medium tracking-[0.02em] text-slate-500">{{ item.label }}</p>
        <p class="text-3xl font-semibold tracking-tight text-slate-900">{{ item.value }}</p>
        <p class="max-w-[18rem] text-sm leading-6 text-slate-600">{{ item.description }}</p>
        <div class="h-px w-12 bg-gradient-to-r from-[#dfcfb6] to-transparent" />
      </div>
    </button>
  </section>
</template>
