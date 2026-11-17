import type {JSONContent} from '@tiptap/core'
import {stripUnsafeLinks} from './stripUnsafeLinks'

const emptyDoc: JSONContent = {type: 'doc', content: [{type: 'paragraph'}]}
export const convertToTipTap = (contentStr: string | null | undefined) => {
  if (!contentStr) return emptyDoc
  let parsedContent: JSONContent
  try {
    parsedContent = JSON.parse(contentStr)
  } catch {
    return emptyDoc
  }
  return stripUnsafeLinks(parsedContent)
}
