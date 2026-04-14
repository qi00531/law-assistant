<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ReviewMode from '../ReviewMode.vue'
import type { ReviewModeContent } from '../../types/review'
import type { NoteItem } from '../../types/savedNotes'

const emit = defineEmits<{
  (event: 'start-review'): void
  (event: 'close-review'): void
  (event: 'review-complete', action: 'remembered' | 'review-later' | 'practice-more'): void
  (event: 'update-note', payload: { id: string; title: string; summary: string }): void
}>()

const props = defineProps<{
  note: NoteItem | null
  reviewContent?: ReviewModeContent | null
}>()

const isEditing = ref(false)
const editTitle = ref('')
const editSummary = ref('')
const copied = ref(false)

const syncDraft = () => {
  editTitle.value = props.note?.title ?? ''
  editSummary.value = props.note?.summary ?? ''
}

watch(
  () => props.note,
  () => {
    copied.value = false
    isEditing.value = false
    syncDraft()
  },
  { immediate: true },
)

const canSave = computed(() => editTitle.value.trim().length > 0 && editSummary.value.trim().length > 0)

const handleSave = () => {
  if (!props.note || !canSave.value) return

  emit('update-note', {
    id: props.note.id,
    title: editTitle.value.trim(),
    summary: editSummary.value.trim(),
  })
  isEditing.value = false
}

const handleCancelEdit = () => {
  isEditing.value = false
  syncDraft()
}

const handleCopy = async () => {
  if (!props.note) return

  const text = [
    props.note.title,
    '',
    `摘要：${props.note.summary}`,
    `来源问题：${props.note.sourceQuestion}`,
    '',
    '结构化摘要：',
    ...props.note.structuredSummary.map((item, index) => `${index + 1}. ${item}`),
    '',
    '关键要点：',
    ...props.note.keyPoints.map((item, index) => `${index + 1}. ${item}`),
  ].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <section class="surface-card min-h-[720px] overflow-hidden">
    <template v-if="props.note">
      <template v-if="reviewContent">
        <div class="border-b border-slate-100 bg-gradient-to-br from-white via-white to-brandSoft/70 px-6 py-6 sm:px-8">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">{{ props.note.title }}</h2>
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
              @click="emit('close-review')"
            >
              收起复习
            </button>
          </div>
        </div>

        <div class="px-6 py-6 sm:px-8">
          <ReviewMode :content="reviewContent" @complete="emit('review-complete', $event)" />
        </div>
      </template>

      <template v-else>
        <div class="border-b border-slate-100 bg-gradient-to-br from-white via-white to-brandSoft/70 px-6 py-6 sm:px-8">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {{ props.note.category }}
                </span>
                <span
                  v-if="props.note.needsReview"
                  class="rounded-full bg-[#fff1de] px-3 py-1 text-xs font-semibold text-[#a15b00]"
                >
                  待复习
                </span>
              </div>
              <div class="space-y-2">
                <template v-if="isEditing">
                  <div class="space-y-3">
                    <input
                      v-model="editTitle"
                      type="text"
                      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-2xl font-semibold tracking-tight text-slate-900 outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                    />
                    <textarea
                      v-model="editSummary"
                      rows="3"
                      class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-600 outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
                    />
                  </div>
                </template>
                <template v-else>
                  <h2 class="text-3xl font-semibold tracking-tight text-slate-900">{{ props.note.title }}</h2>
                  <p class="max-w-3xl text-sm leading-7 text-slate-600">{{ props.note.summary }}</p>
                </template>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                :disabled="isEditing && !canSave"
                :class="isEditing && !canSave ? 'cursor-not-allowed opacity-60' : ''"
                @click="isEditing ? handleSave() : (isEditing = true)"
              >
                {{ isEditing ? '保存修改' : '编辑笔记' }}
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-2xl border border-brand/20 bg-brandSoft/40 px-4 py-2.5 text-sm font-medium text-brand transition hover:border-brand/30 hover:bg-brandSoft/70"
                @click="handleCopy"
              >
                {{ copied ? '已复制' : '复制笔记' }}
              </button>
              <button
                v-if="isEditing"
                type="button"
                class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-white"
                @click="handleCancelEdit"
              >
                取消
              </button>
            </div>
          </div>

          <div class="mt-6 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">上次学习</p>
              <p class="mt-1 text-slate-700">{{ props.note.lastLearningTime }}</p>
            </div>
            <div class="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">创建时间</p>
              <p class="mt-1 text-slate-700">{{ props.note.createdAt }}</p>
            </div>
            <div class="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">知识分类</p>
              <p class="mt-1 text-slate-700">{{ props.note.category }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-8 px-6 py-6 sm:px-8">

          <section class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">来源问题</p>
            <div class="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
              <p class="text-base font-medium leading-7 text-slate-800">{{ props.note.sourceQuestion }}</p>
            </div>
          </section>

          <section class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">结构化摘要</p>
              <span class="text-sm text-slate-400">{{ props.note.structuredSummary.length }} 条摘要</span>
            </div>
            <div class="grid gap-3">
              <article
                v-for="(item, index) in props.note.structuredSummary"
                :key="item"
                class="rounded-[24px] border border-slate-200 bg-white p-5"
              >
                <p class="text-sm font-semibold text-brand">摘要 {{ index + 1 }}</p>
                <p class="mt-2 text-sm leading-7 text-slate-600">{{ item }}</p>
              </article>
            </div>
          </section>

          <div class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <section class="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">关键要点</p>
                <span class="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                  {{ props.note.keyPoints.length }} 项
                </span>
              </div>
              <ul class="mt-4 space-y-3">
                <li
                  v-for="point in props.note.keyPoints"
                  :key="point"
                  class="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm"
                >
                  {{ point }}
                </li>
              </ul>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-[#fbf7ef] p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a7a43]">学习建议</p>
              <ul class="mt-4 space-y-3">
                <li
                  v-for="suggestion in props.note.suggestions"
                  :key="suggestion"
                  class="rounded-2xl border border-[#efdcb7] bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600"
                >
                  {{ suggestion }}
                </li>
              </ul>
            </section>
          </div>

          <section class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">标签</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in props.note.tags"
                :key="tag"
                class="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600"
              >
                {{ tag }}
              </span>
            </div>
          </section>
        </div>
      </template>
    </template>

    <div v-else class="grid min-h-[720px] place-items-center px-6 py-10 text-center">
      <div class="max-w-sm space-y-3">
        <p class="text-lg font-semibold text-slate-900">选择一张卡片开始阅读</p>
        <p class="text-sm leading-6 text-slate-500">
          左侧列表会保留你的浏览上下文，右侧则用于沉浸式回看当前知识卡片。
        </p>
      </div>
    </div>
  </section>
</template>
