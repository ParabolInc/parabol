import type {JSONContent} from '@tiptap/react'

export const draftAnswerKey = (stageId: string, promptId: string) =>
  `draftAnswer:${stageId}:${promptId}`

export const readDraftAnswer = (stageId: string, promptId: string): JSONContent | null => {
  try {
    const raw = window.localStorage.getItem(draftAnswerKey(stageId, promptId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const writeDraftAnswer = (stageId: string, promptId: string, doc: JSONContent) => {
  try {
    window.localStorage.setItem(draftAnswerKey(stageId, promptId), JSON.stringify(doc))
  } catch {}
}

export const clearDraftAnswers = (stageId: string, promptIds: readonly string[]) => {
  try {
    promptIds.forEach((promptId) =>
      window.localStorage.removeItem(draftAnswerKey(stageId, promptId))
    )
  } catch {}
}

export const clearStageDrafts = (stageId: string) => {
  const prefix = draftAnswerKey(stageId, '')
  try {
    const {localStorage} = window
    const staleKeys: string[] = []
    for (let idx = 0; idx < localStorage.length; idx++) {
      const key = localStorage.key(idx)
      if (key?.startsWith(prefix)) staleKeys.push(key)
    }
    staleKeys.forEach((key) => localStorage.removeItem(key))
  } catch {}
}
