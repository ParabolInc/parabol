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

const CONTENT_ATOM_TYPES = new Set([
  'database',
  'emojiMention',
  'fileBlock',
  'fileUpload',
  'horizontalRule',
  'image',
  'imageBlock',
  'insightsBlock',
  'loom',
  'mention',
  'pageLinkBlock',
  'pageUserMention',
  'popoverMention',
  'responseBlock',
  'tableOfContents',
  'taskBlock',
  'taskTag',
  'thinkingBlock'
])

const hasText = (node: JSONContent): boolean =>
  !!node.text?.trim() || (node.content ?? []).some(hasText)

const hasContentAtom = (node: JSONContent): boolean =>
  (!!node.type && CONTENT_ATOM_TYPES.has(node.type)) || (node.content ?? []).some(hasContentAtom)

export const isDocEmpty = (doc: JSONContent | null) =>
  !doc || (!hasText(doc) && !hasContentAtom(doc))
