import {getSchema, type JSONContent} from '@tiptap/core'
import {Node} from '@tiptap/pm/model'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'

const schema = getSchema(serverTipTapExtensions)

const withoutPageLinks = (nodes: JSONContent[]): JSONContent[] =>
  nodes
    .filter((node) => node.type !== 'pageLinkBlock')
    .map((node) => (node.content ? {...node, content: withoutPageLinks(node.content)} : node))

const isValidNode = (node: JSONContent) => {
  try {
    Node.fromJSON(schema, node).check()
    return true
  } catch {
    return false
  }
}

export const sanitizeSyncedBlockSeed = (seed: unknown): JSONContent[] => {
  if (!Array.isArray(seed)) return []
  return withoutPageLinks(
    seed.filter((node): node is JSONContent => !!node && typeof node === 'object')
  ).filter(isValidNode)
}
