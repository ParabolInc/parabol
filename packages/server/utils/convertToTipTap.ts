import {getSchema, type JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {serverTipTapExtensions} from '../../client/shared/tiptap/serverTipTapExtensions'
import {stripUnsafeLinks} from './stripUnsafeLinks'

const schema = getSchema(serverTipTapExtensions)

const emptyDoc: JSONContent = {type: 'doc', content: [{type: 'paragraph'}]}

const badInput = (message: string) =>
  new GraphQLError(message, {extensions: {code: 'BAD_USER_INPUT'}})

const invalidDocument = (reason: string) =>
  badInput(`The content is not a valid editor document: ${reason}`)

const hasNoBlocks = ({content}: JSONContent) =>
  content === undefined || (Array.isArray(content) && content.length === 0)

export const parseEditorDoc = (contentStr: string) => {
  let doc: JSONContent
  try {
    doc = JSON.parse(contentStr)
  } catch {
    throw badInput(
      'content must be stringified TipTap JSON, such as {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}. Markdown and plain text are refused.'
    )
  }
  if (doc?.type !== 'doc') throw invalidDocument('the top node must be a doc')
  if (!hasNoBlocks(doc)) {
    try {
      schema.nodeFromJSON(doc).check()
    } catch (error) {
      throw invalidDocument(error instanceof Error ? error.message : String(error))
    }
  }
  return stripUnsafeLinks(doc)
}

export const convertToTipTap = (contentStr: string | null | undefined) =>
  contentStr ? parseEditorDoc(contentStr) : emptyDoc

export const readStoredTipTap = (contentStr: string | null | undefined) => {
  if (!contentStr) return emptyDoc
  try {
    return stripUnsafeLinks(JSON.parse(contentStr))
  } catch {
    return emptyDoc
  }
}
