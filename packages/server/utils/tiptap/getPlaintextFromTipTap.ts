import {generateText, type JSONContent} from '@tiptap/core'
import {getTitleFromPageText} from '../../../client/shared/tiptap/getTitleFromPageText'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'

export const getPlaintextFromTipTap = (content: JSONContent) => {
  const docText = generateText(content, serverTipTapExtensions)
  const {title, contentStartsAt} = getTitleFromPageText(docText)
  const plaintextContent = docText.slice(contentStartsAt)
  return {title, plaintextContent}
}
