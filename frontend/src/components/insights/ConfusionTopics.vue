<script setup lang="ts">
import type { ConfusionTopicItem } from '../../data/mockInsightsData'

defineProps<{
  items: ConfusionTopicItem[]
}>()
</script>

<template>
  <section class="surface-card p-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-slate-900">最近最容易卡住</p>
        <p class="mt-1 text-sm leading-6 text-slate-500">不是不会，而是还在形成稳定判断。</p>
      </div>
      <span class="rounded-full bg-[#fff3e1] px-3 py-1 text-xs font-medium text-[#a15b00]">
        重点回看
      </span>
    </div>

    <div class="mt-4 space-y-3">
      <article
        v-for="topic in items"
        :key="topic.title"
        class="rounded-[24px] border border-slate-100 bg-[#fcfaf7] px-4 py-4"
      >
        <h3 class="text-base font-semibold text-slate-900">{{ topic.title }}</h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ topic.detail }}</p>
        <p class="mt-3 text-xs font-medium tracking-[0.02em] text-[#8b5e1c]">{{ topic.hint }}</p>
      </article>
    </div>
  </section>
</template>
