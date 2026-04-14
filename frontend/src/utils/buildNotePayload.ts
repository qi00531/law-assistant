import type { LearningResultResponse } from '../types/ask'
import type { NoteCreateRequest } from '../types/notes'

const serializeStatutes = (result: LearningResultResponse) =>
  result.statutes.map((item) => [item.title, item.article, item.content].filter(Boolean).join(' '))

const inferTags = (question: string, result: LearningResultResponse) => {
  const tags = new Set<string>()
  const source = `${question} ${serializeStatutes(result).join(' ')}`.toLowerCase()

  if (source.includes('民法典')) tags.add('民法典')
  if (source.includes('刑法')) tags.add('刑法')
  if (source.includes('合同')) tags.add('合同法')
  if (source.includes('代理')) tags.add('代理')
  if (source.includes('防卫') || source.includes('犯罪')) tags.add('刑法')

  if (tags.size === 0) {
    tags.add('法律学习')
  }

  return Array.from(tags).slice(0, 3)
}

const extractTitle = (question: string, result: LearningResultResponse) => {
  const cleaned = result.question || question
  const normalized = cleaned.replace(/[？?。！!]+$/g, '').trim()
  const patterns = [/什么是(.+)/, /(.+)的区别/, /(.+)的构成要件/, /如何理解(.+)/, /关于(.+)/]

  for (const pattern of patterns) {
    const match = normalized.match(pattern)
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  return normalized.length > 24 ? `${normalized.slice(0, 24)}…` : normalized
}

export const buildNotePayloadFromLearningResult = (
  question: string,
  result: LearningResultResponse,
): NoteCreateRequest => ({
  title: extractTitle(question, result),
  question: result.question || question,
  summary: result.concept,
  tags: inferTags(question, result),
  content: {
    concept: result.concept,
    elements: result.elements,
    example: result.example,
    mistakes: result.mistakes,
    statutes: result.statutes,
    confusions: result.confusions,
  },
})
