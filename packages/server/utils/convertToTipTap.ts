import {JSONContent} from '@tiptap/core'
import {Bold} from '@tiptap/extension-bold'
import {Document} from '@tiptap/extension-document'
import {Paragraph} from '@tiptap/extension-paragraph'
import {Text} from '@tiptap/extension-text'
import {generateJSON} from '@tiptap/html'
import {convertFromRaw, RawDraftContentState} from 'draft-js'
import {Options, stateToHTML} from 'draft-js-export-html'
import {isDraftJSContent} from '../../client/shared/isDraftJSContent'
import {serverTipTapExtensions} from '../../client/shared/serverTipTapExtensions'

export const convertKnownDraftToTipTap = (content: RawDraftContentState) => {
  const contentState = convertFromRaw(content)
  // TODO: blockRenderers! convert entity map to match what tiptap expects
  const options: Options = {
    entityStyleFn: (entity) => {
      const entityType = entity.getType().toLowerCase()
      console.log('entity', entity, entityType)
      const data = entity.getData()
      console.log('data', data)
      if (entityType === 'tag') {
        return {
          element: 'span',
          attributes: {
            'data-id': data.value,
            'data-type': 'taskTag'
          }
        }
      }
      // TODO FIX ME WHEN WE DO THE CONVERSION
      if (entityType === 'mention') {
        return {
          element: 'span',
          attributes: {
            'data-id': data.value,
            'data-label': data.label
          }
        }
      }
      return
    }
  }
  const html = stateToHTML(contentState, options)
  const json = generateJSON(html, serverTipTapExtensions) as JSONContent
  console.log('coverted', html, JSON.stringify(json))
  return json
}
export const convertToTipTap = (contentStr: string | null | undefined) => {
  // TODO: add extensions to handle tags and mentions
  const tipTapExtensions = [Document, Paragraph, Text, Bold]
  if (!contentStr) {
    // return an empty str
    return generateJSON(`<p></p>`, tipTapExtensions) as JSONContent
  }
  let parsedContent: JSONContent | RawDraftContentState
  try {
    parsedContent = JSON.parse(contentStr)
  } catch (e) {
    return generateJSON(`<p></p>`, tipTapExtensions) as JSONContent
  }
  if (!isDraftJSContent(parsedContent)) return parsedContent
  return convertKnownDraftToTipTap(parsedContent)
}
