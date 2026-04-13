import type { AskHistoryItem, LearningResultResponse } from '../types/ask'
import type { NoteCreateRequest, NoteResponse } from '../types/notes'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || 'http://127.0.0.1:8000'

interface ApiErrorPayload {
  detail?: string
}

const getErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as ApiErrorPayload
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail
    }
  } catch {
    // Fall through to generic message.
  }

  return `请求失败（${response.status}）`
}

export const askLegalQuestion = async (
  question: string,
  history: AskHistoryItem[] = [],
): Promise<LearningResultResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, history }),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return (await response.json()) as LearningResultResponse
}

export const createLearningNote = async (payload: NoteCreateRequest): Promise<NoteResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return (await response.json()) as NoteResponse
}

export const fetchLearningNotes = async (): Promise<NoteResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/api/notes`)

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  const list = (await response.json()) as Array<
    Omit<NoteResponse, 'question' | 'content'> & {
      key_points_count?: number
      review_status?: string
    }
  >

  return list.map((item) => ({
    id: item.id,
    title: item.title,
    question: item.title,
    summary: item.summary,
    tags: item.tags,
    content: {
      concept: item.summary,
      elements: [],
      example: '',
      mistakes: [],
      statutes: [],
      confusions: [],
    },
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
}

export const fetchLearningNote = async (noteId: number): Promise<NoteResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`)

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return (await response.json()) as NoteResponse
}
