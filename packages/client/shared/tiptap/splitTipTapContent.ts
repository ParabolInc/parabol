import {generateText, JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from './serverTipTapExtensions'

export const splitTipTapContent = (doc: JSONContent, maxLength = 256) => {
  const [firstBlock, ...bodyBlocks] = doc.content!
  const fullTitle = generateText({...doc, content: [firstBlock!]}, serverTipTapExtensions)
    // Remove newlines from the title
    .split(/\s/)
    .filter((s) => s.length)
    .join(' ')
  if (fullTitle.length < maxLength) {
    const bodyText = generateText({...doc, content: bodyBlocks}, serverTipTapExtensions)
    const content = bodyText.trim().length > 0 ? bodyBlocks : doc.content!
    return {title: fullTitle, bodyContent: {...doc, content}}
  }
  return {
    title: fullTitle.slice(0, maxLength),
    // repeat the full title in the body since we had to truncate it
    bodyContent: doc
  }
}
