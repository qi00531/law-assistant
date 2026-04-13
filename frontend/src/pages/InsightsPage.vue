<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ConfusedPairs from '../components/insights/ConfusedPairs.vue'
import ConfusionTopics from '../components/insights/ConfusionTopics.vue'
import InsightDetailPanel from '../components/insights/InsightDetailPanel.vue'
import InsightOverviewCards from '../components/insights/InsightOverviewCards.vue'
import LearningTrend from '../components/insights/LearningTrend.vue'
import NoteCard from '../components/notes/NoteCard.vue'
import { useReviewSession } from '../composables/useReviewSession'
import { insightPanels } from '../data/mockInsightPanels'
import {
  confusedPairs,
  confusionTopics,
  insightOverview,
  learningTimeline,
  learningTrend,
} from '../data/mockInsightsData'
import type { NoteItem } from '../data/mockNotesData'
import { buildReviewContentFromTimeline } from '../data/reviewModeData'
import MainLayout from '../layouts/MainLayout.vue'
import { router } from '../router'

const activeOverviewKey = ref(insightOverview[0]?.label ?? '')
const selectedTimelineId = ref('')
const { openReviewSession } = useReviewSession()

const learningRecordCards = computed<NoteItem[]>(() =>
  learningTimeline.map((item, index) => ({
    id: item.id,
    title: item.topic,
    summary: item.result,
    tags: [item.mood],
    lastLearningTime: item.time,
    lastLearningOrder: index,
    createdAt: item.time,
    importance: 1,
    needsReview: true,
    category: '学习记录',
    sourceQuestion: item.topic,
    structuredSummary: [item.result],
    keyPoints: [],
    suggestions: [`建议围绕「${item.topic}」再做一次定向复习。`],
  })),
)

const filteredLearningRecordCards = computed(() => {
  switch (activeOverviewKey.value) {
    case '待复习':
      return learningRecordCards.value.filter((item) => item.summary.includes('卡') || item.summary.includes('待回看') || item.summary.includes('还要再练'))
    case '累计掌握':
      return learningRecordCards.value.filter((item) => item.summary.includes('能') || item.summary.includes('记住') || item.summary.includes('完成'))
    case '今日学习':
      return learningRecordCards.value.filter((item) => item.lastLearningTime.includes('今天'))
    case '本周学习':
      return learningRecordCards.value
    default:
      return learningRecordCards.value
  }
})

const cardTone = computed<'default' | 'warning' | 'success' | 'focus' | 'cool'>(() => {
  switch (activeOverviewKey.value) {
    case '待复习':
      return 'warning'
    case '累计掌握':
      return 'success'
    case '本周学习':
      return 'focus'
    case '今日学习':
      return 'cool'
    default:
      return 'default'
  }
})

watch(
  filteredLearningRecordCards,
  (items) => {
    if (items.length === 0) {
      selectedTimelineId.value = ''
      return
    }

    const exists = items.some((item) => item.id === selectedTimelineId.value)
    if (!exists) {
      selectedTimelineId.value = items[0].id
    }
  },
  { immediate: true },
)

const activePanelContent = computed(
  () => insightPanels.find((item) => item.key === activeOverviewKey.value) ?? insightPanels[0],
)

const openTimelineReview = (itemId: string) => {
  const item = learningTimeline.find((entry) => entry.id === itemId)
  if (!item) return

  openReviewSession({
    title: item.topic,
    subtitle: '',
    content: buildReviewContentFromTimeline(item),
  })
  void router.push('/review')
}

</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <InsightOverviewCards
        :items="insightOverview"
        :active-key="activeOverviewKey"
        @select="activeOverviewKey = $event"
      />

      <section class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <NoteCard
          v-for="note in filteredLearningRecordCards"
          :key="note.id"
          :note="note"
          :selected="note.id === selectedTimelineId"
          :tone="cardTone"
          @select="selectedTimelineId = note.id"
          @review="openTimelineReview(note.id)"
        />
      </section>

      <div
        v-if="filteredLearningRecordCards.length === 0"
        class="rounded-[24px] border border-dashed border-slate-200 bg-white/80 px-6 py-12 text-center"
      >
        <p class="text-base font-semibold text-slate-800">这一类里暂时没有对应卡片</p>
        <p class="mt-2 text-sm leading-6 text-slate-500">切换顶部卡片，可以查看其他阶段的学习记录。</p>
      </div>

      <InsightDetailPanel :panel="activePanelContent" />

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <LearningTrend :items="learningTrend" />

        <div class="space-y-6">
          <ConfusionTopics :items="confusionTopics" />
          <ConfusedPairs :items="confusedPairs" />
        </div>
      </section>
    </div>
  </MainLayout>
</template>
