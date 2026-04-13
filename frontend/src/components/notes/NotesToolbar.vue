<script setup lang="ts">
import type { NoteTag } from '../../data/mockNotesData'

defineProps<{
  searchTerm: string
  selectedTag: NoteTag | '全部'
  layoutMode: 'grid' | 'masonry'
  tags: readonly NoteTag[]
}>()

const emit = defineEmits<{
  (event: 'update:searchTerm', value: string): void
  (event: 'update:selectedTag', value: NoteTag | '全部'): void
  (event: 'update:layoutMode', value: 'grid' | 'masonry'): void
}>()
</script>

<template>
  <section class="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4 shadow-sm">
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <input
          :value="searchTerm"
          type="text"
          placeholder="搜索笔记"
          class="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
          @input="emit('update:searchTerm', ($event.target as HTMLInputElement).value)"
        />
        <button
          type="button"
          class="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          @click="emit('update:layoutMode', layoutMode === 'grid' ? 'masonry' : 'grid')"
        >
          切换布局
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          :class="
            selectedTag === '全部'
              ? 'border-brand bg-brand text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
          "
          class="rounded-full border px-3 py-2 text-sm font-medium transition"
          @click="emit('update:selectedTag', '全部')"
        >
          全部
        </button>
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          :class="
            selectedTag === tag
              ? 'border-brand bg-brand text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
          "
          class="rounded-full border px-3 py-2 text-sm font-medium transition"
          @click="emit('update:selectedTag', tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>
  </section>
</template>
