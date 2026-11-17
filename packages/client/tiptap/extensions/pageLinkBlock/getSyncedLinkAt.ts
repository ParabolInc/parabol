import type {Node} from '@tiptap/pm/model'

export const getSyncedLinkAt = (doc: Node, pos: number, pageCode?: number) => {
  const node = doc.nodeAt(pos)
  if (node?.type.name !== 'pageLinkBlock' || !node.attrs.synced) return null
  if (pageCode !== undefined && Number(node.attrs.pageCode) !== pageCode) return null
  return node
}
