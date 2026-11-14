import type {Node} from '@tiptap/pm/model'

export type BlockRange = {from: number; to: number; depth: number}

const LIST_NAMES = new Set(['bulletList', 'orderedList', 'taskList'])

export const isUnitParent = (node: Node) =>
  node.type.name === 'doc' ||
  LIST_NAMES.has(node.type.name) ||
  node.type.name === 'detailsContent' ||
  node.type.name === 'callout'

const CONTAINER_NAMES = new Set([
  'doc',
  'bulletList',
  'orderedList',
  'taskList',
  'listItem',
  'taskItem',
  'details',
  'detailsContent',
  'callout'
])

export const isUnitContainer = (node: Node) => CONTAINER_NAMES.has(node.type.name)

export const isBlockUnit = (node: Node, parent: Node, index: number) =>
  isUnitParent(parent) &&
  node.type.name !== 'calloutTitle' &&
  !(parent.type.name === 'doc' && index === 0)

export const getBlockUnitAt = (doc: Node, pos: number): BlockRange | null => {
  const $pos = doc.resolve(pos)
  let unitDepth = 0
  for (let depth = 1; depth <= $pos.depth; depth++) {
    const node = $pos.node(depth)
    const parent = $pos.node(depth - 1)
    if (isBlockUnit(node, parent, $pos.index(depth - 1))) unitDepth = depth
    else if (depth === 1) return null
    if (!isUnitContainer(node)) break
  }
  if (unitDepth === 0) return null
  return {from: $pos.before(unitDepth), to: $pos.after(unitDepth), depth: unitDepth - 1}
}

export const normalizeBlockRange = (doc: Node, anchor: number, head: number): BlockRange | null => {
  const titleSize = doc.firstChild?.nodeSize ?? 0
  if (doc.childCount < 2 || (anchor <= titleSize && head <= titleSize)) return null
  const skipTitle = (pos: number) => (pos <= titleSize ? titleSize + 1 : pos)
  const anchorUnit = getBlockUnitAt(doc, skipTitle(anchor))
  const headUnit = getBlockUnitAt(doc, skipTitle(head))
  if (!anchorUnit || !headUnit) return null
  const first = anchorUnit.from <= headUnit.from ? anchorUnit : headUnit
  const last = anchorUnit.from <= headUnit.from ? headUnit : anchorUnit
  const nodeRange = doc.resolve(first.from).blockRange(doc.resolve(last.to), isUnitParent)
  if (!nodeRange) return null
  return {from: nodeRange.start, to: nodeRange.end, depth: nodeRange.depth}
}

export const countBlocks = (doc: Node, range: BlockRange): number =>
  doc.resolve(range.to).index() - doc.resolve(range.from).index()
