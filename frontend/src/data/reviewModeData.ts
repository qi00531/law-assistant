import type { LearningTimelineItem } from './mockInsightsData'
import type { NoteItem } from './mockNotesData'

export interface ReviewModeContent {
  topic: string
  question: string
  hint: string[]
  rule: string[]
  misunderstanding: string
  explanation: string
  statute: string
  example: string
}

export const defaultReviewModeContent: ReviewModeContent = {
  topic: '不安抗辩权',
  question: '不安抗辩权解决的是哪一方先履行时的风险？',
  hint: ['双务合同', '履约能力明显下降'],
  rule: ['有确切证据', '可以中止履行'],
  misunderstanding: '不是主观担心就能停止履行。',
  explanation:
    '不安抗辩权是指双务合同中，先履行一方在有确切证据证明对方履约能力明显下降时，可以中止履行。',
  statute: '《中华人民共和国民法典》第五百二十七条',
  example:
    '例如甲乙签订买卖合同，甲应先交货，但甲发现乙经营严重恶化并拖欠多笔债务，此时甲可以暂时停止交货。',
}

const pickQuestionFromNote = (note: NoteItem) => note.sourceQuestion || `如何重新理解「${note.title}」？`

const pickHintFromNote = (note: NoteItem) =>
  [...note.structuredSummary.slice(0, 1), ...note.tags.slice(0, 1), ...note.keyPoints.slice(0, 1)].slice(0, 2)

const pickRuleFromNote = (note: NoteItem) => note.keyPoints.slice(0, 2)

const pickMisunderstandingFromNote = (note: NoteItem) =>
  note.suggestions[0] ?? `复习「${note.title}」时，不要只记结论，记得回到适用条件。`

export const buildReviewContentFromNote = (note: NoteItem): ReviewModeContent => ({
  topic: note.title,
  question: pickQuestionFromNote(note),
  hint: pickHintFromNote(note).length > 0 ? pickHintFromNote(note) : note.tags.slice(0, 2),
  rule: pickRuleFromNote(note).length > 0 ? pickRuleFromNote(note) : note.structuredSummary.slice(0, 2),
  misunderstanding: pickMisunderstandingFromNote(note),
  explanation: `${note.summary} ${note.structuredSummary[0] ?? ''}`.trim(),
  statute: note.tags.includes('民法典') ? '建议结合《中华人民共和国民法典》对应条文复习。' : '建议回到对应法条或制度规则继续核对。',
  example: note.suggestions[1] ?? `可以围绕「${note.title}」再练一个具体案例，帮助把抽象规则落到情境中。`,
})

export const buildReviewContentFromTimeline = (item: LearningTimelineItem): ReviewModeContent => {
  const topic = item.topic
  const segments = item.result
    .split(/[，。；]/)
    .map((segment) => segment.trim())
    .filter(Boolean)

  return {
    topic,
    question: `回到「${topic}」时，你最先应该想起的核心判断是什么？`,
    hint: [topic, item.mood],
    rule: segments.slice(0, 2).length > 0 ? segments.slice(0, 2) : ['先回到主题主线', '再确认关键区分点'],
    misunderstanding: `复习「${topic}」时，不要只记住这次学习的感觉，还要回到真正的判断条件。`,
    explanation: item.result,
    statute: '可以在下一轮复习时补上对应法条或制度依据。',
    example: `以「${topic}」为中心，再练一个相似问题，会更容易把这次理解固定下来。`,
  }
}
