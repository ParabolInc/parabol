import {getSchema, type JSONContent} from '@tiptap/core'
import {Node} from '@tiptap/pm/model'
import {serverTipTapExtensions} from './serverTipTapExtensions'

export const STANDUP_RESPONSE_CHARACTER_LIMIT = 1000

const LEAF_NODE_TEXT = ' '

const schema = getSchema(serverTipTapExtensions)

export const isStandupResponseTooLong = (doc: JSONContent) => {
  const node = Node.fromJSON(schema, doc)
  const text = node.textBetween(0, node.content.size, undefined, LEAF_NODE_TEXT)
  return text.length > STANDUP_RESPONSE_CHARACTER_LIMIT
}
