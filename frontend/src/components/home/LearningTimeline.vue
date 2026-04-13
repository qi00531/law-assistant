<script setup lang="ts">
import type { ReviewModeContent } from '../../data/reviewModeData'
import type { LearningTimelineItem } from '../../types/homeTimeline'
import LearningTimelineItemCard from './LearningTimelineItem.vue'

defineProps<{
  items: LearningTimelineItem[]
  activeReviewId: string | null
  reviewContent?: ReviewModeContent | null
}>()

const emit = defineEmits<{
  (event: 'start-review', itemId: string): void
  (event: 'complete-review', action: 'remembered' | 'review-later' | 'practice-more'): void
  (event: 'save-item', itemId: string): void
}>()
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col gap-5">
    <LearningTimelineItemCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      :show-review="activeReviewId === item.id"
      :review-content="activeReviewId === item.id ? reviewContent : null"
      @start-review="emit('start-review', $event)"
      @complete-review="emit('complete-review', $event)"
      @save-item="emit('save-item', $event)"
    />
  </section>
</template>
