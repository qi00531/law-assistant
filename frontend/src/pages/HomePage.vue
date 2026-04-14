<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ExampleQuestionChips from '../components/home/ExampleQuestionChips.vue'
import LearningTimeline from '../components/home/LearningTimeline.vue'
import QuestionInput from '../components/home/QuestionInput.vue'
import { useHomepageTheme } from '../composables/useHomepageTheme'
import { exampleQuestions } from '../data/exampleQuestions'
import { buildReviewContentFromNote } from '../data/reviewModeData'
import MainLayout from '../layouts/MainLayout.vue'
import { askLegalQuestion, createLearningNote, fetchLearningNote, fetchLearningNotes } from '../lib/api'
import type { LearningTimelineItem } from '../types/homeTimeline'
import type { ReviewModeContent } from '../types/review'
import type { NoteItem } from '../types/savedNotes'
import { buildAskHistory } from '../utils/homepageHistory'
import { buildSessionNotePayload } from '../utils/buildSessionNotePayload'
import { findRelatedSavedNote } from '../utils/findRelatedSavedNote'
import { mapLearningResultToTimelineItem } from '../utils/mapTimelineItem'
import { toNoteItem } from '../utils/noteMappers'

const draftQuestion = ref('')
const timelineItems = ref<LearningTimelineItem[]>([])
const isSubmitting = ref(false)
const submitError = ref('')
const activeReviewId = ref<string | null>(null)
const savedNotes = ref<NoteItem[]>([])

const { theme } = useHomepageTheme()

const activeReviewContent = computed<ReviewModeContent | null>(() => {
  const reviewItem = timelineItems.value.find((item) => item.id === activeReviewId.value)
  if (!reviewItem?.relatedNote) return null

  const matchedNote = savedNotes.value.find((note) => note.id === reviewItem.relatedNote?.id)
  return matchedNote ? buildReviewContentFromNote(matchedNote) : null
})

const loadSavedNotes = async () => {
  try {
    const list = await fetchLearningNotes()
    const detailedNotes = await Promise.all(list.map((item) => fetchLearningNote(item.id)))
    savedNotes.value = detailedNotes.map(toNoteItem)
  } catch {
    savedNotes.value = []
  }
}

onMounted(() => {
  void loadSavedNotes()
})

const submitQuestion = async (question: string, relation: 'root' | 'follow_up' = 'root') => {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const result = await askLegalQuestion(trimmedQuestion, buildAskHistory(timelineItems.value))
    const resolvedQuestion = result.question || trimmedQuestion
    const relatedNote = findRelatedSavedNote(savedNotes.value, resolvedQuestion)
    const nextItem = mapLearningResultToTimelineItem({
      question: resolvedQuestion,
      relation,
      result,
      relatedNote,
    })

    timelineItems.value = [...timelineItems.value, nextItem]
    draftQuestion.value = ''
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '提问失败，请稍后重试。'
  } finally {
    isSubmitting.value = false
  }
}

const handleDraftSubmit = (question: string) => {
  const relation = timelineItems.value.length === 0 ? 'root' : 'follow_up'
  void submitQuestion(question, relation)
}

const handleExampleSelect = (question: string) => {
  const relation = timelineItems.value.length === 0 ? 'root' : 'follow_up'
  void submitQuestion(question, relation)
}

const handleSaveItem = async (itemId: string) => {
  const target = timelineItems.value.find((item) => item.id === itemId)
  if (!target || target.saveState === 'saving' || target.saveState === 'saved') return

  timelineItems.value = timelineItems.value.map((item) =>
    item.id === itemId
      ? {
          ...item,
          saveState: 'saving',
          saveFeedback: '',
        }
      : item,
  )

  try {
    const payload = buildSessionNotePayload(timelineItems.value)
    const saved = await createLearningNote(payload)
    const savedNoteItem = toNoteItem(saved)
    savedNotes.value = [savedNoteItem, ...savedNotes.value.filter((note) => note.id !== savedNoteItem.id)]
    timelineItems.value = timelineItems.value.map((item) =>
      item.id === itemId
        ? {
            ...item,
            saveState: 'saved',
            saveFeedback: `已保存汇总卡片：${saved.title}`,
          }
        : item,
    )
  } catch (error) {
    timelineItems.value = timelineItems.value.map((item) =>
      item.id === itemId
        ? {
            ...item,
            saveState: 'error',
            saveFeedback: error instanceof Error ? error.message : '保存失败，请稍后重试。',
          }
        : item,
    )
  }
}

const handleReviewComplete = (action: 'remembered' | 'review-later' | 'practice-more') => {
  const reviewItem = timelineItems.value.find((item) => item.id === activeReviewId.value)

  if (action === 'practice-more' && reviewItem) {
    void submitQuestion(`${reviewItem.question} · 再练一个相关问题`, 'follow_up')
    return
  }

  if (action !== 'review-later') {
    activeReviewId.value = null
  }
}
</script>

<template>
  <MainLayout>
    <section :class="theme === 'dark' ? 'home-theme-dark' : 'home-theme-light'" class="home-timeline-layout">
      <div
        class="home-timeline-scroll"
        :class="timelineItems.length > 0 ? 'space-y-6' : 'flex items-center justify-center'"
      >
        <div v-if="timelineItems.length === 0" class="mx-auto flex w-full max-w-5xl flex-col gap-4 py-10">
          <div class="text-center">
            <h1
              class="font-serif text-4xl font-semibold tracking-[0.18em] text-slate-950 sm:text-5xl"
              style="text-shadow: 0 8px 30px rgba(15, 23, 42, 0.08)"
            >
              法小智
            </h1>
          </div>
          <ExampleQuestionChips :questions="exampleQuestions" @select="handleExampleSelect" />
          <QuestionInput
            v-model="draftQuestion"
            :button-text="isSubmitting ? '分析中…' : '发送问题'"
            :disabled="isSubmitting"
            placeholder="输入法律问题，例如：什么是不安抗辩权"
            @submit="handleDraftSubmit"
          />
        </div>

        <template v-if="timelineItems.length > 0">
          <LearningTimeline
            :items="timelineItems"
            :active-review-id="activeReviewId"
            :review-content="activeReviewContent"
            @start-review="activeReviewId = $event"
            @complete-review="handleReviewComplete"
            @save-item="handleSaveItem"
          />
        </template>

        <p v-if="submitError" class="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm leading-7 text-rose-700">
          {{ submitError }}
        </p>
      </div>

      <div v-if="timelineItems.length > 0" class="home-fixed-composer space-y-4">
        <ExampleQuestionChips :questions="exampleQuestions" @select="handleExampleSelect" />
        <QuestionInput
          v-model="draftQuestion"
          :button-text="isSubmitting ? '分析中…' : '发送问题'"
          :disabled="isSubmitting"
          placeholder="输入法律问题，例如：什么是不安抗辩权"
          @submit="handleDraftSubmit"
        />
      </div>
    </section>
  </MainLayout>
</template>
