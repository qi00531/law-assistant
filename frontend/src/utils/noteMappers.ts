import type { NoteResponse } from '../types/notes'
import type { NoteItem } from '../types/savedNotes'

const formatDateLabel = (value: string) => value.slice(0, 10)

const formatRelativeLabel = (value: string) => {
  const target = new Date(value)
  const diffDays = Math.round((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  if (Number.isNaN(diffDays)) return formatDateLabel(value)
  if (diffDays === 0) return '今天'
  if (diffDays === -1) return '昨天'
  if (diffDays > -7) return `${Math.abs(diffDays)} 天前`
  return formatDateLabel(value)
}

export const toNoteItem = (note: NoteResponse): NoteItem => ({
  id: String(note.id),
  title: note.title,
  summary: note.summary,
  tags: note.tags,
  lastLearningTime: formatRelativeLabel(note.updated_at),
  lastLearningOrder: -new Date(note.updated_at).getTime(),
  createdAt: formatDateLabel(note.created_at),
  importance: Math.max(note.tags.length, 1),
  needsReview: note.content.elements.length > 0,
  category: note.tags[0] ?? '法律学习',
  sourceQuestion: note.question,
  structuredSummary: [note.content.concept, ...note.content.confusions.map((item) => `${item.term}：${item.difference}`)]
    .filter(Boolean)
    .slice(0, 3),
  keyPoints: note.content.elements,
  suggestions: [
    ...note.content.mistakes,
    ...note.content.statutes.map((item) => {
      const statute = [item.title, item.article].filter(Boolean).join(' ')
      const content = item.content.trim()
      const summary = statute || content
      return `建议结合条文复习：${summary.slice(0, 36)}${summary.length > 36 ? '…' : ''}`
    }),
  ].slice(0, 3),
})
