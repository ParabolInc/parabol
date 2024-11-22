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
import {Logger} from './Logger'

const getNameFromEntity = (content: RawDraftContentState, userId: string) => {
  const {blocks, entityMap} = content
  const entityKey = Number(
    Object.keys(entityMap).find((key) => entityMap[key]!.data?.userId === userId)
  )
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!
    const {entityRanges, text} = block
    const entityRange = entityRanges.find((range) => range.key === entityKey)
    if (!entityRange) continue
    const {length, offset} = entityRange
    return text.slice(offset, offset + length)
  }
  Logger.log('found unknown for', userId, JSON.stringify(content))
  return 'Unknown User'
}

export const convertKnownDraftToTipTap = (content: RawDraftContentState) => {
  const contentState = convertFromRaw(content)
  // TODO: blockRenderers! convert entity map to match what tiptap expects
  const options: Options = {
    entityStyleFn: (entity) => {
      const entityType = entity.getType().toLowerCase()
      const data = entity.getData()
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
        const label = getNameFromEntity(content, data.userId)
        return {
          element: 'span',
          attributes: {
            'data-id': data.userId,
            'data-label': label,
            'data-type': 'mention'
          }
        }
      }
      return
    }
  }
  const html = stateToHTML(contentState, options)
  const json = generateJSON(html, serverTipTapExtensions) as JSONContent
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
