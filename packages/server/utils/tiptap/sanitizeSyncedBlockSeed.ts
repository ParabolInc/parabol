import {getSchema, type JSONContent} from '@tiptap/core'
import {Node} from '@tiptap/pm/model'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import type {TipTapContentNode} from '../../../client/shared/tiptap/TipTapSerializedContent'

const schema = getSchema(serverTipTapExtensions)
const emptyHeading = schema.nodes.heading!.create({level: 1})

const DROPPED_NODE_NAMES = new Set(['pageLinkBlock', 'thinkingBlock', 'fileUpload'])

const isNodeJSON = (node: unknown): node is JSONContent =>
  !!node && typeof node === 'object' && !Array.isArray(node)

const withoutPageLinks = (nodes: unknown[]): JSONContent[] =>
  nodes
    .filter(isNodeJSON)
    .filter((node) => !node.type || !DROPPED_NODE_NAMES.has(node.type))
    .map((node) =>
      Array.isArray(node.content) ? {...node, content: withoutPageLinks(node.content)} : node
    )

const toBlockUnderHeading = (node: JSONContent): Node | null => {
  try {
    const block = Node.fromJSON(schema, node)
    schema.nodes.doc!.create(null, [emptyHeading, block]).check()
    return block
  } catch {
    return null
  }
}

export const sanitizeSyncedBlockSeed = (seed: unknown): TipTapContentNode[] => {
  if (!Array.isArray(seed)) return []
  const blocks: TipTapContentNode[] = []
  withoutPageLinks(seed).forEach((node) => {
    const block = toBlockUnderHeading(node)
    if (block) blocks.push(block.toJSON())
  })
  return blocks
}
