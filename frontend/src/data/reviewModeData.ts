import type { NoteItem } from '../types/savedNotes'
import type { ReviewModeContent } from '../types/review'

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
