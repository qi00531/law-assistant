<script setup lang="ts">
import type { NoteItem } from '../../types/savedNotes'

import NoteCard from './NoteCard.vue'

defineProps<{
  notes: NoteItem[]
  selectedNoteId: string
  layoutMode: 'grid' | 'masonry'
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (event: 'select', noteId: string): void
  (event: 'review', noteId: string): void
}>()
</script>

<template>
  <section class="surface-card p-4 sm:p-5">
    <div
      v-if="isLoading"
      class="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center"
    >
      <p class="text-base font-semibold text-slate-800">正在加载卡片</p>
      <p class="mt-2 text-sm leading-6 text-slate-500">已保存的内容会在这里实时显示。</p>
    </div>

    <div v-else-if="notes.length > 0">
      <div v-if="layoutMode === 'grid'" class="grid gap-4">
        <NoteCard
          v-for="note in notes"
          :key="note.id"
          :note="note"
          :selected="note.id === selectedNoteId"
          @select="emit('select', note.id)"
          @review="emit('review', note.id)"
        />
      </div>

      <div v-else class="columns-1 gap-4 md:columns-2">
        <div v-for="note in notes" :key="note.id" class="mb-4 break-inside-avoid">
          <NoteCard
            :note="note"
            :selected="note.id === selectedNoteId"
            @select="emit('select', note.id)"
            @review="emit('review', note.id)"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center"
    >
      <p class="text-base font-semibold text-slate-800">没有找到匹配的笔记</p>
      <p class="mt-2 text-sm leading-6 text-slate-500">
        可以调整关键词、切换标签，或者回到全部笔记继续浏览。
      </p>
    </div>
  </section>
</template>
