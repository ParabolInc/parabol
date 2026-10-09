import {TiptapTransformer} from '@hocuspocus/transformer'
import StarterKit from '@tiptap/starter-kit'
import * as Y from 'yjs'
import {
  PAGE_COMMENT_MARK_NAME,
  PageCommentMarkBase
} from '../../../client/shared/tiptap/extensions/PageCommentMarkBase'

export const MAX_PAGE_THREAD_QUOTE_LENGTH = 500

const markExtensions = [StarterKit, PageCommentMarkBase]

// The yjs binding stores a mark that may overlap itself under a hashed attribute name.
// Deriving the name with the binding keeps it identical to the one the clients write
const getMarkAttributeName = (threadId: string) => {
  const doc = TiptapTransformer.toYdoc(
    {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {type: 'text', text: ' ', marks: [{type: PAGE_COMMENT_MARK_NAME, attrs: {threadId}}]}
          ]
        }
      ]
    },
    'default',
    markExtensions
  )
  const paragraph = doc.getXmlFragment('default').get(0) as Y.XmlElement
  const text = paragraph.get(0) as Y.XmlText
  const [attributeName] = Object.keys(text.toDelta()[0].attributes)
  return attributeName as string
}

const isMarkAttributeName = (attributeName: string) =>
  attributeName === PAGE_COMMENT_MARK_NAME ||
  attributeName.startsWith(`${PAGE_COMMENT_MARK_NAME}--`)

const isText = (yxml: unknown): yxml is Y.XmlText => yxml instanceof Y.XmlText

const getPlaintext = (text: Y.XmlText) =>
  (text.toDelta() as {insert: unknown}[])
    .map(({insert}) => (typeof insert === 'string' ? insert : ' '))
    .join('')

const resolveTextPosition = (doc: Y.Doc, encodedRelativePosition: string) => {
  try {
    const relativePosition = Y.decodeRelativePosition(
      Buffer.from(encodedRelativePosition, 'base64')
    )
    const position = Y.createAbsolutePositionFromRelativePosition(relativePosition, doc)
    return position && isText(position.type) ? {text: position.type, index: position.index} : null
  } catch {
    return null
  }
}

// Returns the text that got marked, or null if the positions no longer describe a range of text
export const markPageThread = (
  doc: Y.Doc,
  threadId: string,
  encodedAnchor: string,
  encodedHead: string
) => {
  const start = resolveTextPosition(doc, encodedAnchor)
  const end = resolveTextPosition(doc, encodedHead)
  if (!start || !end) return null
  const ranges: {text: Y.XmlText; index: number; length: number}[] = []
  let isRangeOpen = false
  let isRangeClosed = false
  for (const text of doc.getXmlFragment('default').createTreeWalker(isText)) {
    if (!isText(text)) continue
    if (text === start.text) isRangeOpen = true
    if (isRangeOpen) {
      const from = text === start.text ? start.index : 0
      const to = text === end.text ? end.index : text.length
      if (to > from) ranges.push({text, index: from, length: to - from})
    }
    if (text === end.text) {
      isRangeClosed = isRangeOpen
      break
    }
  }
  if (!isRangeClosed) return null
  const quote = ranges
    .map(({text, index, length}) => getPlaintext(text).slice(index, index + length))
    .join(' ')
    .trim()
  if (!quote) return null
  const attributeName = getMarkAttributeName(threadId)
  doc.transact(() => {
    ranges.forEach(({text, index, length}) => {
      text.format(index, length, {[attributeName]: {threadId}})
    })
  })
  return quote.slice(0, MAX_PAGE_THREAD_QUOTE_LENGTH)
}

export const unmarkPageThread = (doc: Y.Doc, threadId: string) => {
  doc.transact(() => {
    for (const text of doc.getXmlFragment('default').createTreeWalker(isText)) {
      if (!isText(text)) continue
      let index = 0
      const ops = text.toDelta() as {insert: unknown; attributes?: Record<string, unknown>}[]
      ops.forEach(({insert, attributes}) => {
        const length = typeof insert === 'string' ? insert.length : 1
        Object.entries(attributes ?? {}).forEach(([attributeName, value]) => {
          const isThreadMark =
            isMarkAttributeName(attributeName) &&
            (value as {threadId?: string} | null)?.threadId === threadId
          if (isThreadMark) text.format(index, length, {[attributeName]: null})
        })
        index += length
      })
    }
  })
}
