import type { ConfusionItem } from './ask'

export interface NoteContentPayload {
  concept: string
  elements: string[]
  example: string
  mistakes: string[]
  statutes: string[]
  confusions: ConfusionItem[]
}

export interface NoteCreateRequest {
  title: string
  question: string
  summary: string
  tags: string[]
  content: NoteContentPayload
}

export interface NoteResponse {
  id: number
  title: string
  question: string
  summary: string
  tags: string[]
  content: NoteContentPayload
  created_at: string
  updated_at: string
}
