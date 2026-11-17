import {generateText, type JSONContent} from '@tiptap/core'
import {getTitleFromPageText} from '../../../client/shared/tiptap/getTitleFromPageText'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import {Logger} from '../Logger'

export const getPlaintextFromTipTap = (content: JSONContent) => {
  let docText = ''
  try {
    // Postgres text columns reject NUL
    docText = generateText(content, serverTipTapExtensions).replaceAll('\u0000', '')
  } catch (e) {
    Logger.log((e as Error)?.message || 'Unable to generateText')
    return {title: '', plaintextContent: ''}
  }
  const {title, contentStartsAt} = getTitleFromPageText(docText)
  const plaintextContent = docText.slice(contentStartsAt)
  return {title, plaintextContent}
}
