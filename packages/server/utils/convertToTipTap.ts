import type {JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {stripUnsafeLinks} from './stripUnsafeLinks'

const emptyDoc: JSONContent = {type: 'doc', content: [{type: 'paragraph'}]}

export const createInvalidContentError = () =>
  new GraphQLError(
    'content must be stringified TipTap JSON, such as {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}. Markdown and plain text are refused.',
    {extensions: {code: 'BAD_USER_INPUT'}}
  )

export const convertToTipTap = (contentStr: string | null | undefined) => {
  if (!contentStr) return emptyDoc
  let parsedContent: JSONContent
  try {
    parsedContent = JSON.parse(contentStr)
  } catch {
    throw createInvalidContentError()
  }
  if (parsedContent?.type !== 'doc') throw createInvalidContentError()
  return stripUnsafeLinks(parsedContent)
}
