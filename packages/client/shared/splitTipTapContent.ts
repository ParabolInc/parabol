import {generateText, JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from './serverTipTapExtensions'

export const splitTipTapContent = (doc: JSONContent, maxLength = 256) => {
  const [firstBlock, ...bodyBlocks] = doc.content!
  const fullTitle = generateText({...doc, content: [firstBlock!]}, serverTipTapExtensions)
  if (fullTitle.length < maxLength) {
    return {title: fullTitle, bodyContent: {...doc, content: bodyBlocks}}
  }
  return {
    title: fullTitle.slice(0, maxLength),
    // repeat the full title in the body since we had to truncate it
    bodyContent: doc
  }
}
