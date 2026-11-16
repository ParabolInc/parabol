import type {Node} from '@tiptap/pm/model'

export const findSyncedBlockPositions = (doc: Node, blockPageCode: number) => {
  const canonical: number[] = []
  const copies: number[] = []
  doc.descendants((node, pos) => {
    if (node.type.name !== 'pageLinkBlock') return
    if (node.attrs.synced !== true || Number(node.attrs.pageCode) !== blockPageCode) return
    ;(node.attrs.canonical === true ? canonical : copies).push(pos)
  })
  return [...canonical, ...copies]
}
