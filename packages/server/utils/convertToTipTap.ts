import {JSONContent} from '@tiptap/core'

const emptyDoc: JSONContent = {type: 'doc', content: [{type: 'paragraph'}]}
export const convertToTipTap = (contentStr: string | null | undefined) => {
  if (!contentStr) return emptyDoc
  let parsedContent: JSONContent
  try {
    parsedContent = JSON.parse(contentStr)
  } catch (e) {
    return emptyDoc
  }
  return parsedContent
}
