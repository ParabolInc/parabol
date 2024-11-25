import {JSONContent} from '@tiptap/core'
import {Bold} from '@tiptap/extension-bold'
import {Document} from '@tiptap/extension-document'
import {Paragraph} from '@tiptap/extension-paragraph'
import {Text} from '@tiptap/extension-text'
import {generateJSON} from '@tiptap/html'
import {convertFromRaw, RawDraftContentState} from 'draft-js'
import {stateToHTML} from 'draft-js-export-html'

const isDraftJSContent = (
  content: JSONContent | RawDraftContentState
): content is RawDraftContentState => {
  return 'blocks' in content
}

export const convertToTipTap = (contentStr: string | null | undefined) => {
  // TODO: add extensions to handle tags and mentions
  const tipTapExtensions = [Document, Paragraph, Text, Bold]
  if (!contentStr) {
    // return an empty str
    return generateJSON(`<p></p>`, tipTapExtensions)
  }
  let parsedContent: JSONContent | RawDraftContentState
  try {
    parsedContent = JSON.parse(contentStr)
  } catch (e) {
    return generateJSON(`<p></p>`, tipTapExtensions)
  }
  if (!isDraftJSContent(parsedContent)) return parsedContent
  const contentState = convertFromRaw(parsedContent)
  // TODO: blockRenderers! convert entity map to match what tiptap expects
  const html = stateToHTML(contentState)
  return generateJSON(html, tipTapExtensions) as JSONContent
}
