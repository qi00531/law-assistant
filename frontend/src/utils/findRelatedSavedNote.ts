import type { RelatedSavedNote } from '../types/homeTimeline'
import type { NoteItem } from '../types/savedNotes'

const normalize = (value: string) =>
  value
    .trim()
    .replace(/[，。！？、,.!?;；:“”"'（）()\s]/g, '')
    .toLowerCase()

const toBigrams = (input: string) =>
  input.length < 2
    ? new Set([input])
    : new Set(Array.from({ length: input.length - 1 }, (_, index) => input.slice(index, index + 2)))

const score = (left: string, right: string) => {
  if (!left || !right) return 0
  if (left === right) return 1
  if (left.includes(right) || right.includes(left)) return 0.9

  const leftPairs = toBigrams(left)
  const rightPairs = toBigrams(right)
  const union = new Set([...leftPairs, ...rightPairs])
  const intersection = [...leftPairs].filter((pair) => rightPairs.has(pair))

  return intersection.length / union.size
}

export const findRelatedSavedNote = (notes: NoteItem[], question: string): RelatedSavedNote | null => {
  const normalized = normalize(question)

  const match = notes.find((note) => {
    const fields = [note.title, note.summary, note.sourceQuestion]
    return fields.some((field) => score(normalized, normalize(field)) >= 0.72)
  })

  return match
    ? {
        id: match.id,
        title: match.title,
        summary: match.summary,
      }
    : null
}
