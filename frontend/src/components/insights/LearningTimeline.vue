<script setup lang="ts">
import type { LearningTimelineItem } from '../../data/mockInsightsData'

defineProps<{
  items: LearningTimelineItem[]
}>()

const emit = defineEmits<{
  (event: 'review', itemId: string): void
}>()
</script>

<template>
  <section class="surface-card overflow-hidden">
    <div class="border-b border-slate-100 bg-gradient-to-r from-white via-[#faf7f1] to-white px-6 py-5">
      <p class="text-sm font-semibold text-slate-900">最近学习记录</p>
      <p class="mt-1 text-sm leading-6 text-slate-500">
        把最近几次学习拆成独立记录回看，会更容易看出哪里已经掌握、哪里还需要再收一次。
      </p>
    </div>

    <div class="px-6 py-5">
      <div class="space-y-5">
        <article
          v-for="item in items"
          :key="item.id"
          class="rounded-[26px] border border-slate-200 bg-white p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-900">{{ item.topic }}</p>
              <p class="mt-1 text-sm text-slate-400">{{ item.time }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-brandSoft px-3 py-1 text-xs font-medium text-brand">
                {{ item.mood }}
              </span>
              <button
                type="button"
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                @click="emit('review', item.id)"
              >
                重新复习
              </button>
            </div>
          </div>
          <p class="mt-3 text-sm leading-7 text-slate-600">{{ item.result }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
