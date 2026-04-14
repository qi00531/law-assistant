<script setup lang="ts">
import type { NoteItem } from '../../types/savedNotes'

const props = withDefaults(
  defineProps<{
  note: NoteItem
  selected?: boolean
  tone?: 'default' | 'warning' | 'success' | 'focus' | 'cool'
}>(),
  {
    selected: false,
    tone: 'default',
  },
)

const emit = defineEmits<{
  (event: 'select'): void
  (event: 'review'): void
}>()

const toneClassMap = {
  default: 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg',
  warning: 'border-orange-200 bg-orange-50/80 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg',
  success: 'border-emerald-200 bg-emerald-50/75 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg',
  focus: 'border-violet-200 bg-violet-50/75 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg',
  cool: 'border-sky-200 bg-sky-50/80 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg',
} as const
</script>

<template>
  <article
    :class="
      props.selected
        ? 'border-brand bg-brandSoft/40 shadow-[0_18px_40px_rgba(43,90,156,0.14)]'
        : toneClassMap[props.tone]
    "
    class="rounded-[24px] border p-5 transition"
  >
    <div class="block w-full text-left">
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {{ props.note.category }}
            </span>
            <span
              v-if="props.note.needsReview"
              class="rounded-full bg-[#fff1de] px-2.5 py-1 text-[11px] font-semibold text-[#a15b00]"
            >
              待复习
            </span>
          </div>
          <h3 class="text-lg font-semibold text-slate-900">{{ props.note.title }}</h3>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          @click.stop="emit('review')"
        >
          进入复习
        </button>
      </div>

      <button type="button" class="mt-3 block w-full text-left" @click="emit('select')">
        <p class="text-sm leading-6 text-slate-600">{{ props.note.summary }}</p>

        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in props.note.tags"
            :key="tag"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {{ tag }}
          </span>
        </div>
        <div class="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <span>上次学习：{{ props.note.lastLearningTime }}</span>
        </div>
      </button>
    </div>
  </article>
</template>
