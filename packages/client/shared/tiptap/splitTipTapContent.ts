import {generateText, type JSONContent} from '@tiptap/core'
import {removeNodeByType} from './removeNodeByType'
import {serverTipTapExtensions} from './serverTipTapExtensions'
import type {TipTapSerializedContent} from './TipTapSerializedContent'

export const splitTipTapContent = (rawDoc: JSONContent, maxLength = 256) => {
  const doc = removeNodeByType(rawDoc, 'taskTag')
  const [firstBlock, ...bodyBlocks] = doc.content!
  const fullTitle = generateText({...doc, content: [firstBlock!]}, serverTipTapExtensions)
    // Remove newlines from the title
    .split(/\s/)
    .filter((s) => s.length)
    .join(' ')
  if (fullTitle.length < maxLength) {
    const bodyText = generateText({...doc, content: bodyBlocks}, serverTipTapExtensions)
    const content = bodyText.trim().length > 0 ? bodyBlocks : doc.content!
    return {title: fullTitle, bodyContent: {...doc, content} as TipTapSerializedContent}
  }
  return {
    title: fullTitle.slice(0, maxLength),
    // repeat the full title in the body since we had to truncate it
    bodyContent: doc as TipTapSerializedContent
  }
}
