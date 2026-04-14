import type { NoteCreateRequest } from '../types/notes'
import type { LearningTimelineItem } from '../types/homeTimeline'
import type { StatuteItem } from '../types/ask'

const uniq = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))
const serializeStatute = (title: string, article: string, content: string) =>
  [title, article, content].filter(Boolean).join(' ')
const titlePatterns = [/什么是(.+)/, /(.+)的区别/, /(.+)的构成要件/, /如何理解(.+)/, /关于(.+)/]

const extractKnowledgeTitle = (value: string) => {
  const normalized = value.replace(/[？?。！!]+$/g, '').trim()

  for (const pattern of titlePatterns) {
    const match = normalized.match(pattern)
    if (match?.[1]) {
      return match[1].trim()
    }
  }

  const conceptMatch = normalized.match(/^(.+?)是指/)
  if (conceptMatch?.[1]) {
    return conceptMatch[1].trim()
  }

  return normalized
}

const inferSessionTitle = (items: LearningTimelineItem[]) => {
  const lastItem = items.at(-1)
  const conceptTitle = lastItem?.result.concept ? extractKnowledgeTitle(lastItem.result.concept) : ''
  if (conceptTitle) return conceptTitle

  const questionTitle = lastItem?.result.question ? extractKnowledgeTitle(lastItem.result.question) : ''
  if (questionTitle) return questionTitle

  const fallback = items[0]?.question ? extractKnowledgeTitle(items[0].question) : ''
  return fallback || '法律学习笔记'
}

const inferTags = (items: LearningTimelineItem[]) => {
  const combined = items
    .flatMap((item) => [
      item.question,
      item.result.concept,
      ...item.result.statutes.map((statute) =>
        serializeStatute(statute.title, statute.article, statute.content),
      ),
    ])
    .join(' ')
  const tags = new Set<string>()

  if (combined.includes('民法典')) tags.add('民法典')
  if (combined.includes('刑法')) tags.add('刑法')
  if (combined.includes('合同')) tags.add('合同法')
  if (combined.includes('代理')) tags.add('代理')
  if (combined.includes('侵权')) tags.add('侵权法')

  if (tags.size === 0) tags.add('法律学习')

  return Array.from(tags).slice(0, 3)
}

const uniqStatutes = (items: StatuteItem[]) => {
  const seen = new Set<string>()

  return items.filter((item) => {
    const key = serializeStatute(item.title, item.article, item.content)
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export const buildSessionNotePayload = (items: LearningTimelineItem[]): NoteCreateRequest => {
  const [rootItem, ...rest] = items
  const allResults = items.map((item) => item.result)
  const summaryParts = [
    rootItem?.result.concept ?? '',
    ...rest.map((item) => `${item.question}：${item.result.concept}`),
  ].filter(Boolean)

  return {
    title: inferSessionTitle(items),
    question: rootItem?.question || '法律学习笔记',
    summary: summaryParts.join(' ').slice(0, 1000),
    tags: inferTags(items),
    content: {
      concept: summaryParts.join(' '),
      elements: uniq(allResults.flatMap((result) => result.elements)),
      example: allResults
        .map((result) => result.example.trim())
        .filter(Boolean)
        .join('；'),
      mistakes: uniq(allResults.flatMap((result) => result.mistakes)),
      statutes: uniqStatutes(allResults.flatMap((result) => result.statutes)),
      confusions: allResults.flatMap((result) => result.confusions),
    },
  }
}
