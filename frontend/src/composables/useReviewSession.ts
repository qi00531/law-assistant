import { computed, ref } from 'vue'

import type { ReviewModeContent } from '../data/reviewModeData'

const reviewTitle = ref('复习模式')
const reviewSubtitle = ref('')
const reviewContent = ref<ReviewModeContent | null>(null)

export const useReviewSession = () => {
  const openReviewSession = (payload: {
    title?: string
    subtitle?: string
    content: ReviewModeContent
  }) => {
    reviewTitle.value = payload.title?.trim() || payload.content.topic || '复习模式'
    reviewSubtitle.value = payload.subtitle?.trim() || ''
    reviewContent.value = payload.content
  }

  const clearReviewSession = () => {
    reviewTitle.value = '复习模式'
    reviewSubtitle.value = ''
    reviewContent.value = null
  }

  return {
    reviewTitle: computed(() => reviewTitle.value),
    reviewSubtitle: computed(() => reviewSubtitle.value),
    reviewContent: computed(() => reviewContent.value),
    openReviewSession,
    clearReviewSession,
  }
}
