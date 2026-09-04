import type {JSONContent} from '@tiptap/react'

export const draftAnswerKey = (stageId: string, promptId: string) =>
  `draftAnswer:${stageId}:${promptId}`

export const readDraftAnswer = (stageId: string, promptId: string): JSONContent | null => {
  const raw = window.localStorage.getItem(draftAnswerKey(stageId, promptId))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const writeDraftAnswer = (stageId: string, promptId: string, doc: JSONContent) => {
  window.localStorage.setItem(draftAnswerKey(stageId, promptId), JSON.stringify(doc))
}

export const clearDraftAnswers = (stageId: string, promptIds: readonly string[]) => {
  promptIds.forEach((promptId) => window.localStorage.removeItem(draftAnswerKey(stageId, promptId)))
}

export const isDocEmpty = (doc: JSONContent | null) =>
  !doc?.content?.some((node) => node.type !== 'paragraph' || !!node.content?.length)
