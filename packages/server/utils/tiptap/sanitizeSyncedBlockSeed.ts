import {getSchema, type JSONContent} from '@tiptap/core'
import {Node} from '@tiptap/pm/model'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import type {TipTapContentNode} from '../../../client/shared/tiptap/TipTapSerializedContent'

const schema = getSchema(serverTipTapExtensions)
const emptyHeading = schema.nodes.heading!.create({level: 1})

const DROPPED_NODE_NAMES = new Set(['pageLinkBlock', 'thinkingBlock'])

const isNodeJSON = (node: unknown): node is JSONContent =>
  !!node && typeof node === 'object' && !Array.isArray(node)

const withoutPageLinks = (nodes: unknown[]): JSONContent[] =>
  nodes
    .filter(isNodeJSON)
    .filter((node) => !node.type || !DROPPED_NODE_NAMES.has(node.type))
    .map((node) =>
      Array.isArray(node.content) ? {...node, content: withoutPageLinks(node.content)} : node
    )

const canFollowHeading = (node: JSONContent) => {
  try {
    schema.nodes.doc!.create(null, [emptyHeading, Node.fromJSON(schema, node)]).check()
    return true
  } catch {
    return false
  }
}

export const sanitizeSyncedBlockSeed = (seed: unknown): TipTapContentNode[] => {
  if (!Array.isArray(seed)) return []
  return withoutPageLinks(seed).filter(canFollowHeading) as TipTapContentNode[]
}
