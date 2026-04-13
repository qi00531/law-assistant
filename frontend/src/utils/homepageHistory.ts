import type { AskHistoryItem } from '../types/ask'
import type { LearningTimelineItem } from '../types/homeTimeline'

export const buildAskHistory = (items: LearningTimelineItem[]): AskHistoryItem[] =>
  items.map((item) => ({
    question: item.question,
    answer: item.result,
  }))
