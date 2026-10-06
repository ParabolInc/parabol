import {generateText, type JSONContent} from '@tiptap/core'
import {removeNodeByType} from './removeNodeByType'
import {serverTipTapExtensions} from './serverTipTapExtensions'
import type {TipTapSerializedContent} from './TipTapSerializedContent'

const toText = (doc: JSONContent, content: JSONContent[]) =>
  generateText({...doc, content}, serverTipTapExtensions)
    .split(/\s/)
    .filter(Boolean)
    .join(' ')

export const splitTipTapContent = (rawDoc: JSONContent, maxTitleLength = 255) => {
  const doc = removeNodeByType(rawDoc, 'taskTag')
  const blocks = (doc.content ?? []).filter(
    (block) => block.type !== 'paragraph' || toText(doc, [block])
  )
  const [titleBlock, ...bodyBlocks] = blocks
  const title = titleBlock ? toText(doc, [titleBlock]) : ''
  const isTitleExcerpt = title.length > maxTitleLength
  const content = isTitleExcerpt ? blocks : bodyBlocks
  return {
    title: title.slice(0, maxTitleLength),
    bodyContent: content.length > 0 ? ({...doc, content} as TipTapSerializedContent) : null,
    isTitleExcerpt
  }
}
