import type {JSONContent} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'

export type MovableBlocks = {
  blocks: JSONContent[]
  childPages: {pageCode: number; title: string}[]
  hasUpload: boolean
}

const LIST_TYPES = new Set(['bulletList', 'orderedList', 'taskList'])

export const getMovableBlocks = (doc: Node, from: number, to: number): MovableBlocks => {
  const items = (doc.slice(from, to).content.toJSON() ?? []) as JSONContent[]
  const parentType = doc.resolve(from).parent.type.name
  const blocks = LIST_TYPES.has(parentType) ? [{type: parentType, content: items}] : items
  const childPages: MovableBlocks['childPages'] = []
  let hasUpload = false
  doc.nodesBetween(from, to, (node) => {
    if (node.type.name === 'fileUpload') hasUpload = true
    if (
      node.type.name === 'pageLinkBlock' &&
      node.attrs.canonical === true &&
      node.attrs.pageCode !== -1
    ) {
      childPages.push({pageCode: node.attrs.pageCode, title: node.attrs.title})
    }
  })
  return {blocks, childPages, hasUpload}
}
