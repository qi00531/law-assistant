import type { LearningResultResponse } from './ask'
import type { LearningModule } from './learning'

export type TimelineRelation = 'root' | 'follow_up'

export interface RelatedSavedNote {
  id: string
  title: string
  summary: string
}

export interface LearningTimelineItem {
  id: string
  question: string
  relation: TimelineRelation
  relationLabel?: string
  createdAt: string
  result: LearningResultResponse
  modules: LearningModule[]
  relatedNote: RelatedSavedNote | null
  saveState: 'idle' | 'saving' | 'saved' | 'error'
  saveFeedback?: string
}

export interface HomepageSessionSummary {
  title: string
  summary: string
}

export type HomepageTheme = 'light' | 'dark'
