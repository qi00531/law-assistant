import type { LearningResultResponse } from '../types/ask'
import type { LearningTimelineItem, RelatedSavedNote, TimelineRelation } from '../types/homeTimeline'
import { mapLearningResultToModules } from './mapLearningResult'

const buildRelationLabel = (relation: TimelineRelation) =>
  relation === 'follow_up' ? '继续追问' : '主问题'

export const mapLearningResultToTimelineItem = ({
  question,
  relation,
  result,
  relatedNote,
}: {
  question: string
  relation: TimelineRelation
  result: LearningResultResponse
  relatedNote: RelatedSavedNote | null
}): LearningTimelineItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  question,
  relation,
  relationLabel: buildRelationLabel(relation),
  createdAt: new Date().toISOString(),
  result,
  modules: mapLearningResultToModules(result),
  relatedNote,
  saveState: 'idle',
  saveFeedback: '',
})
