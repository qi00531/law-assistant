<script setup lang="ts">
import type { ReviewModeContent } from '../../data/reviewModeData'
import type { LearningTimelineItem } from '../../types/homeTimeline'
import ReviewMode from '../ReviewMode.vue'
import LearningModuleCard from './LearningModuleCard.vue'
import ReviewHintBar from './ReviewHintBar.vue'

defineProps<{
  item: LearningTimelineItem
  showReview: boolean
  reviewContent?: ReviewModeContent | null
}>()

const emit = defineEmits<{
  (event: 'start-review', itemId: string): void
  (event: 'complete-review', action: 'remembered' | 'review-later' | 'practice-more'): void
  (event: 'save-item', itemId: string): void
}>()
</script>

<template>
  <article class="surface-card space-y-5 p-5 sm:p-6">
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{{ item.relationLabel }}</p>
        <span class="text-xs uppercase tracking-[0.18em] text-slate-400">
          {{ new Date(item.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
        </span>
      </div>
      <h2 class="text-2xl font-semibold text-slate-950">{{ item.question }}</h2>
      <p class="text-sm leading-7 text-slate-500">
        当前结果已保留在本页，继续输入下一个问题时会自动结合前文上下文回答。
      </p>
    </div>

    <ReviewHintBar
      v-if="item.relatedNote"
      :title="item.relatedNote.title"
      :summary="item.relatedNote.summary"
      @start-review="emit('start-review', item.id)"
    />

    <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <LearningModuleCard
        v-for="module in item.modules"
        :key="`${item.id}-${module.key}`"
        :content="module.content"
        :icon="module.icon"
        :title="module.title"
      />
    </div>

    <ReviewMode
      v-if="showReview && reviewContent"
      :content="reviewContent"
      @complete="emit('complete-review', $event)"
    />

    <div class="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p
        v-if="item.saveFeedback"
        :class="item.saveState === 'error' ? 'text-rose-600' : 'text-emerald-600'"
        class="text-sm leading-6"
      >
        {{ item.saveFeedback }}
      </p>
      <div class="sm:ml-auto">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          :disabled="item.saveState === 'saving' || item.saveState === 'saved'"
          @click="emit('save-item', item.id)"
        >
          {{
            item.saveState === 'saved'
              ? '已理解并保存'
              : item.saveState === 'saving'
                ? '保存中…'
                : '我已理解'
          }}
        </button>
      </div>
    </div>
  </article>
</template>
