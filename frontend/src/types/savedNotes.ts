export type NoteTag = string

export interface NoteItem {
  id: string
  title: string
  summary: string
  tags: string[]
  lastLearningTime: string
  lastLearningOrder: number
  createdAt: string
  importance: number
  needsReview?: boolean
  category: string
  sourceQuestion: string
  structuredSummary: string[]
  keyPoints: string[]
  suggestions: string[]
}
