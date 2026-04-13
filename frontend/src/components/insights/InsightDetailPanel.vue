<script setup lang="ts">
import type { InsightPanelContent } from '../../data/mockInsightPanels'

defineProps<{
  panel: InsightPanelContent
}>()
</script>

<template>
  <section class="surface-card p-6">
    <div class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand">当前聚焦</p>
      <h2 class="text-2xl font-semibold tracking-tight text-slate-900">{{ panel.title }}</h2>
      <p class="max-w-3xl text-sm leading-7 text-slate-600">{{ panel.description }}</p>
    </div>

    <div class="mt-6 grid gap-3 lg:grid-cols-3">
      <article
        v-for="highlight in panel.highlights"
        :key="highlight"
        class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
      >
        <p class="text-sm leading-7 text-slate-700">{{ highlight }}</p>
      </article>
    </div>

    <div class="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50/70 px-5 py-4">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">学习建议</p>
      <p class="mt-2 text-sm leading-7 text-slate-700">{{ panel.suggestion }}</p>
    </div>
  </section>
</template>
