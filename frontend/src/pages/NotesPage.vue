<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import NoteDetail from '../components/notes/NoteDetail.vue'
import NotesList from '../components/notes/NotesList.vue'
import NotesToolbar from '../components/notes/NotesToolbar.vue'
import { buildReviewContentFromNote } from '../data/reviewModeData'
import MainLayout from '../layouts/MainLayout.vue'
import { fetchLearningNote, fetchLearningNotes } from '../lib/api'
import type { NoteTag, NoteItem } from '../types/savedNotes'
import { toNoteItem } from '../utils/noteMappers'

const searchTerm = ref('')
const selectedTag = ref<NoteTag | '全部'>('全部')
const layoutMode = ref<'grid' | 'masonry'>('grid')
const notesState = ref<NoteItem[]>([])
const selectedNoteId = ref(notesState.value[0]?.id ?? '')
const reviewNoteId = ref('')
const isLoading = ref(false)
const loadError = ref('')

const loadNotes = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const list = await fetchLearningNotes()
    const detailedNotes = await Promise.all(list.map((item) => fetchLearningNote(item.id)))
    notesState.value = detailedNotes.map(toNoteItem)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '加载卡片失败，请稍后重试。'
    notesState.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadNotes()
})

const availableTags = computed(() =>
  Array.from(new Set(notesState.value.flatMap((note) => note.tags))).filter(Boolean),
)

const filteredNotes = computed(() => {
  const keyword = searchTerm.value.trim().toLowerCase()

  const filtered = notesState.value.filter((note) => {
    const matchesTag = selectedTag.value === '全部' || note.tags.includes(selectedTag.value)
    const matchesSearch =
      keyword.length === 0 ||
      [
        note.title,
        note.summary,
        note.sourceQuestion,
        note.category,
        note.tags.join(' '),
        note.structuredSummary.join(' '),
        note.keyPoints.join(' '),
        note.suggestions.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)

    return matchesTag && matchesSearch
  })

  return [...filtered].sort((left, right) => left.lastLearningOrder - right.lastLearningOrder)
})

watch(
  filteredNotes,
  (currentNotes) => {
    if (currentNotes.length === 0) {
      selectedNoteId.value = ''
      return
    }

    const hasSelectedNote = currentNotes.some((note) => note.id === selectedNoteId.value)
    if (!hasSelectedNote) {
      selectedNoteId.value = currentNotes[0].id
    }
  },
  { immediate: true },
)

const selectedNote = computed(
  () => filteredNotes.value.find((note) => note.id === selectedNoteId.value) ?? null,
)

const reviewNote = computed(
  () => filteredNotes.value.find((note) => note.id === reviewNoteId.value) ?? null,
)

const reviewContent = computed(() =>
  reviewNote.value ? buildReviewContentFromNote(reviewNote.value) : null,
)

const handleReviewSelect = (noteId: string) => {
  selectedNoteId.value = noteId
  reviewNoteId.value = noteId
}

const closeReviewMode = () => {
  reviewNoteId.value = ''
}

const handleReviewComplete = (action: 'remembered' | 'review-later' | 'practice-more') => {
  if (action === 'practice-more' && selectedNote.value) {
    reviewNoteId.value = selectedNote.value.id
    return
  }

  if (action !== 'review-later') {
    reviewNoteId.value = ''
  }
}

const handleNoteUpdate = (payload: { id: string; title: string; summary: string }) => {
  notesState.value = notesState.value.map((note) =>
    note.id === payload.id
      ? {
          ...note,
          title: payload.title,
          summary: payload.summary,
        }
      : note,
  )
}
</script>

<template>
  <MainLayout>
    <section class="grid gap-6 xl:min-h-[calc(100vh-3rem)] xl:grid-cols-[minmax(360px,460px)_minmax(0,1fr)]">
      <div class="space-y-5 xl:flex xl:min-h-0 xl:flex-col">
        <NotesToolbar
          :search-term="searchTerm"
          :selected-tag="selectedTag"
          :layout-mode="layoutMode"
          :tags="availableTags"
          @update:search-term="searchTerm = $event"
          @update:selected-tag="selectedTag = $event"
          @update:layout-mode="layoutMode = $event"
        />
        <p v-if="loadError" class="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm leading-7 text-rose-700">
          {{ loadError }}
        </p>
        <div class="xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-2">
          <NotesList
            :is-loading="isLoading"
            :notes="filteredNotes"
            :selected-note-id="selectedNoteId"
            :layout-mode="layoutMode"
            @select="selectedNoteId = $event"
            @review="handleReviewSelect"
          />
        </div>
      </div>

      <div class="xl:min-h-0 xl:overflow-y-auto xl:pr-1">
        <NoteDetail
          :note="selectedNote"
          :review-content="reviewContent"
          @close-review="closeReviewMode"
          @review-complete="handleReviewComplete"
          @update-note="handleNoteUpdate"
        />
      </div>
    </section>
  </MainLayout>
</template>
