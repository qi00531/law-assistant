export interface ConfusionItem {
  term: string
  difference: string
}

export interface StatuteItem {
  title: string
  article: string
  content: string
}

export interface AskHistoryItem {
  question: string
  answer: LearningResultResponse
}

export interface LearningResultResponse {
  question: string
  concept: string
  elements: string[]
  example: string
  mistakes: string[]
  statutes: StatuteItem[]
  confusions: ConfusionItem[]
}
