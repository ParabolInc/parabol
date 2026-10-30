import type {JSONContent} from '@tiptap/core'
import {isAllowedLinkHref} from '../../client/shared/tiptap/isAllowedLinkHref'

type Mark = NonNullable<JSONContent['marks']>[number]

const isSafeMark = (mark: Mark) => mark?.type !== 'link' || isAllowedLinkHref(mark.attrs?.href)

export const stripUnsafeLinks = (node: JSONContent): JSONContent => {
  if (!node || typeof node !== 'object') return node
  const {marks, content} = node
  return {
    ...node,
    ...(Array.isArray(marks) && {marks: marks.filter(isSafeMark)}),
    ...(Array.isArray(content) && {content: content.map(stripUnsafeLinks)})
  }
}
