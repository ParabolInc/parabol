import {getSchema, type JSONContent} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {GraphQLError} from 'graphql'
import {serverTipTapExtensions} from '../../client/shared/tiptap/serverTipTapExtensions'
import {stripUnsafeLinks} from './stripUnsafeLinks'

const schema = getSchema(serverTipTapExtensions)

const emptyDoc: JSONContent = {type: 'doc', content: [{type: 'paragraph'}]}

const badInput = (message: string) =>
  new GraphQLError(message, {extensions: {code: 'BAD_USER_INPUT'}})

const invalidDocument = (reason: string) =>
  badInput(`The content is not a valid editor document: ${reason}`)

const findMisplacedText = (node: JSONContent): string | undefined => {
  if (!node || typeof node !== 'object') return undefined
  if (node.type !== 'text' && 'text' in node) return String(node.type)
  if (!Array.isArray(node.content)) return undefined
  for (const child of node.content) {
    const found = findMisplacedText(child)
    if (found) return found
  }
  return undefined
}

const assertKnownNodes = (doc: JSONContent) => {
  const misplacedText = findMisplacedText(doc)
  if (misplacedText) {
    throw invalidDocument(
      `${misplacedText} has a text key; put text in a {"type":"text"} node inside its content`
    )
  }
  let root: Node
  try {
    root = schema.nodeFromJSON(doc)
  } catch (error) {
    throw invalidDocument(error instanceof Error ? error.message : String(error))
  }
  root.forEach((child) => {
    if (!child.type.isBlock) {
      throw invalidDocument(
        `${child.type.name} is not a block, so it can't sit directly under the doc`
      )
    }
  })
}

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
  assertKnownNodes(doc)
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
