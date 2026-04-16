<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import MainLayout from '../layouts/MainLayout.vue'
import { fetchLearningNote, fetchLearningNotes } from '../lib/api'
import type { NoteItem } from '../types/savedNotes'
import { toNoteItem } from '../utils/noteMappers'

const notes = ref<NoteItem[]>([])
const isLoading = ref(false)
const loadError = ref('')

const loadNotes = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const list = await fetchLearningNotes()
    const detailedNotes = await Promise.all(list.map((item) => fetchLearningNote(item.id)))
    notes.value = detailedNotes.map(toNoteItem).sort((left, right) => left.lastLearningOrder - right.lastLearningOrder)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '加载学习记录失败，请稍后重试。'
    notes.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadNotes()
})

const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

const startOfWeek = () => {
  const now = new Date()
  const day = now.getDay() || 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1)
  return monday.getTime()
}

const updatedTimeOf = (note: NoteItem) => new Date(note.updatedAt).getTime()
const notesToday = computed(() => notes.value.filter((note) => updatedTimeOf(note) >= startOfToday()))
const notesThisWeek = computed(() => notes.value.filter((note) => updatedTimeOf(note) >= startOfWeek()))
const reviewNotes = computed(() => notes.value.filter((note) => note.needsReview))

const latestNotes = computed(() => notes.value.slice(0, 6))

const confusionPairs = computed(() =>
  notes.value
    .flatMap((note) => note.structuredSummary.slice(1).map((item) => ({ noteTitle: note.title, text: item })))
    .slice(0, 6),
)

const categorySummary = computed(() => {
  const counter = new Map<string, number>()

  notes.value.forEach((note) => {
    counter.set(note.category, (counter.get(note.category) ?? 0) + 1)
  })

  return Array.from(counter.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
})

const buildStatus = (note: NoteItem) => {
  const diff = Date.now() - updatedTimeOf(note)
  const day = 1000 * 60 * 60 * 24

  if (diff <= day) {
    return { label: '刚学习', tone: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
  }

  if (diff <= day * 3) {
    return { label: '巩固中', tone: 'text-sky-600 bg-sky-50 border-sky-200' }
  }

  return { label: '待复习', tone: 'text-amber-600 bg-amber-50 border-amber-200' }
}
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <div class="surface-card px-6 py-6 sm:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Insights</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">学习记录</h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          这里会汇总你已经保存的学习内容，帮助你快速看到最近学了什么、哪些内容还需要复习，以及当前学习重点集中在哪些主题。
        </p>
      </div>

      <p v-if="loadError" class="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm leading-7 text-rose-700">
        {{ loadError }}
      </p>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">待复习</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">{{ reviewNotes.length }}</p>
          <p class="mt-2 text-xs text-slate-500">已保存且可继续复习的主题</p>
        </div>
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">累计掌握</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">{{ notes.length }}</p>
          <p class="mt-2 text-xs text-slate-500">已形成学习记录的知识点</p>
        </div>
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">今日学习</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">{{ notesToday.length }}</p>
          <p class="mt-2 text-xs text-slate-500">今天有更新的学习主题</p>
        </div>
        <div class="surface-card px-5 py-4">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">本周学习</p>
          <p class="mt-3 text-3xl font-semibold text-slate-900">{{ notesThisWeek.length }}</p>
          <p class="mt-2 text-xs text-slate-500">本周持续推进的主题数量</p>
        </div>
      </section>

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div class="surface-card px-6 py-6 sm:px-8">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-slate-900">最近学习</h2>
            <span class="text-xs uppercase tracking-[0.18em] text-slate-400">
              {{ isLoading ? 'Loading' : `${latestNotes.length} 条` }}
            </span>
          </div>

          <div v-if="isLoading" class="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
            <p class="text-sm font-semibold text-slate-800">正在同步学习记录</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">稍等一下，已保存的学习主题会显示在这里。</p>
          </div>

          <div v-else-if="latestNotes.length === 0" class="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
            <p class="text-sm font-semibold text-slate-800">暂无学习记录</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">在首页完成学习并点击“我已理解”后，这里就会出现真实记录。</p>
          </div>

          <div v-else class="mt-4 space-y-4">
            <article
              v-for="note in latestNotes"
              :key="note.id"
              class="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {{ note.category }}
                    </span>
                    <span
                      class="rounded-full border px-3 py-1 text-xs font-semibold"
                      :class="buildStatus(note).tone"
                    >
                      {{ buildStatus(note).label }}
                    </span>
                  </div>
                  <h3 class="text-lg font-semibold text-slate-900">{{ note.title }}</h3>
                  <p class="text-sm leading-6 text-slate-600">{{ note.summary }}</p>
                </div>
                <div class="text-right text-sm text-slate-400">
                  <p>{{ note.lastLearningTime }}</p>
                  <p class="mt-1">{{ note.createdAt }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div class="space-y-4">
          <div class="surface-card px-6 py-6 sm:px-8">
            <h2 class="text-lg font-semibold text-slate-900">学习趋势</h2>
            <div v-if="categorySummary.length === 0" class="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
              <p class="text-sm font-semibold text-slate-800">暂无趋势数据</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">等累计更多学习记录后，这里会更明显地反映你的重点方向。</p>
            </div>
            <div v-else class="mt-4 space-y-3">
              <div
                v-for="[category, count] in categorySummary"
                :key="category"
                class="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-slate-800">{{ category }}</p>
                  <span class="text-sm font-medium text-slate-500">{{ count }} 次</span>
                </div>
                <div class="mt-3 h-2 rounded-full bg-white">
                  <div
                    class="h-full rounded-full bg-brand"
                    :style="{ width: `${Math.max((count / Math.max(notes.length, 1)) * 100, 18)}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="surface-card px-6 py-6 sm:px-8">
            <h2 class="text-lg font-semibold text-slate-900">易混概念</h2>
            <div v-if="confusionPairs.length === 0" class="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
              <p class="text-sm font-semibold text-slate-800">暂无易混点</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">当学习内容包含概念区分时，会自动汇总到这里。</p>
            </div>
            <div v-else class="mt-4 space-y-3">
              <article
                v-for="item in confusionPairs"
                :key="`${item.noteTitle}-${item.text}`"
                class="rounded-[22px] border border-slate-200 bg-white px-4 py-4"
              >
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ item.noteTitle }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-700">{{ item.text }}</p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </section>
  </MainLayout>
</template>
