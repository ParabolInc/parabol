import {generateText} from '@tiptap/core'
import convertADFToTipTap, {type AdfNode} from 'parabol-client/shared/tiptap/convertADFToTipTap'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'

// Jira types some descriptions as strings, but its APIs return them as ADF documents, so guard on the runtime shape
const adfToPlaintext = (description: unknown) => {
  if (!description || typeof description !== 'object') return ''
  const tiptap = convertADFToTipTap(description as AdfNode)
  return generateText(tiptap, serverTipTapExtensions).trim()
}

export default adfToPlaintext
