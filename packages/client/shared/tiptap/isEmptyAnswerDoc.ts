import type {JSONContent} from '@tiptap/core'

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

export const isEmptyAnswerDoc = (doc: JSONContent) => !hasText(doc) && !hasContentAtom(doc)
