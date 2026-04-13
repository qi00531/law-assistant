<script setup lang="ts">
import type { ConfusedPairItem } from '../../data/mockInsightsData'

defineProps<{
  items: ConfusedPairItem[]
}>()
</script>

<template>
  <section class="surface-card p-5">
    <div>
      <p class="text-sm font-semibold text-slate-900">建议重点区分</p>
      <p class="mt-1 text-sm leading-6 text-slate-500">把边界讲清楚，答题时会更稳。</p>
    </div>

    <div class="mt-4 space-y-3">
      <article
        v-for="pair in items"
        :key="`${pair.left}-${pair.right}`"
        class="rounded-[24px] border border-[#e8edf4] bg-[#f8fbff] p-4"
      >
        <div class="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
          <span class="rounded-full bg-white px-3 py-1 shadow-sm">{{ pair.left }}</span>
          <span class="text-slate-400">vs</span>
          <span class="rounded-full bg-white px-3 py-1 shadow-sm">{{ pair.right }}</span>
        </div>
        <p class="mt-3 text-sm leading-6 text-slate-600">{{ pair.difference }}</p>
      </article>
    </div>
  </section>
</template>
