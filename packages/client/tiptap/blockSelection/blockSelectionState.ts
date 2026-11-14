import type {Editor} from '@tiptap/core'
import {isNodeRangeSelection, NodeRangeSelection} from '@tiptap/extension-node-range'
import {Fragment, type Node, type ResolvedPos} from '@tiptap/pm/model'
import {type EditorState, NodeSelection, Selection, type Transaction} from '@tiptap/pm/state'
import {
  type BlockRange,
  countBlocks,
  getBlockUnitAt,
  isBlockUnit,
  isUnitParent,
  normalizeBlockRange
} from './blockUnits'
import {getRunFromBoxes, isRunBackward} from './getBlocksInRect'

export const createBlockSelection = (doc: Node, range: BlockRange, isBackward = false) =>
  isBackward
    ? NodeRangeSelection.create(doc, range.to, range.from, range.depth)
    : NodeRangeSelection.create(doc, range.from, range.to, range.depth)

export const selectBlockRange = (editor: Editor, range: BlockRange): void => {
  const {state, view} = editor
  view.dispatch(state.tr.setSelection(createBlockSelection(state.doc, range)))
}

export const getBlockRangeOfSelection = (selection: Selection): BlockRange | null => {
  if (!isNodeRangeSelection(selection)) return null
  const first = selection.ranges[0]
  const last = selection.ranges[selection.ranges.length - 1]
  if (!first || !last) return null
  return {from: first.$from.pos, to: last.$to.pos, depth: first.$from.depth}
}

export const getSelectedBlockRange = (state: EditorState): BlockRange | null =>
  getBlockRangeOfSelection(state.selection)

export const isBlockRun = (doc: Node, range: BlockRange) => {
  if (range.from >= range.to || range.from < 0 || range.to > doc.content.size) return false
  const $from = doc.resolve(range.from)
  const $to = doc.resolve(range.to)
  if ($from.depth !== range.depth || !$from.sameParent($to)) return false
  const first = $from.nodeAfter
  return !!first && isBlockUnit(first, $from.parent, $from.index())
}

const getUnitOfLeaf = (doc: Node, node: Node, pos: number): BlockRange | null => {
  if (node.isTextblock) return getBlockUnitAt(doc, pos + 1)
  const $pos = doc.resolve(pos)
  if (isBlockUnit(node, $pos.parent, $pos.index())) {
    return {from: pos, to: pos + node.nodeSize, depth: $pos.depth}
  }
  return isUnitParent($pos.parent) ? null : getBlockUnitAt(doc, pos)
}

export const getBlockRangeAtCaret = (state: EditorState): BlockRange | null => {
  const {doc, selection} = state
  if (selection instanceof NodeSelection) {
    const {node, from} = selection
    return node.isLeaf ? getUnitOfLeaf(doc, node, from) : getBlockUnitAt(doc, from + 1)
  }
  return normalizeBlockRange(doc, selection.anchor, selection.head)
}

const isHiddenToggleContent = (node: Node, parent: Node | null) =>
  node.type.name === 'detailsContent' && parent?.type.name === 'details' && !parent.attrs.open

export const getAdjacentBlockUnit = (doc: Node, range: BlockRange, dir: 1 | -1) => {
  let found = null as BlockRange | null
  const [from, to] = dir > 0 ? [range.to, doc.content.size] : [0, range.from]
  doc.nodesBetween(from, to, (node, pos, parent) => {
    if (dir > 0 && found) return false
    if (isHiddenToggleContent(node, parent)) return false
    if (dir > 0 && pos < range.to) return true
    if (!node.isTextblock && !(node.isBlock && node.isLeaf)) return true
    found = getUnitOfLeaf(doc, node, pos) ?? found
    return false
  })
  return found
}

export const extendBlockSelection = (doc: Node, selection: NodeRangeSelection, dir: 1 | -1) => {
  const range = getBlockRangeOfSelection(selection)
  if (!range) return null
  const isBackward = selection.head < selection.anchor
  if (countBlocks(doc, range) > 1 && isBackward === dir > 0) {
    const $from = doc.resolve(range.from)
    const $to = doc.resolve(range.to)
    return dir > 0
      ? createBlockSelection(doc, {...range, from: range.from + $from.nodeAfter!.nodeSize}, true)
      : createBlockSelection(doc, {...range, to: range.to - $to.nodeBefore!.nodeSize})
  }
  let run: BlockRange | null = range
  while (run) {
    const $edge = doc.resolve(dir > 0 ? run.to : run.from)
    const sibling = dir > 0 ? $edge.nodeAfter : $edge.nodeBefore
    const isTitle = run.depth === 0 && dir < 0 && $edge.index() === 1
    if (sibling && !isTitle) {
      return dir > 0
        ? createBlockSelection(doc, {...run, to: run.to + sibling.nodeSize})
        : createBlockSelection(doc, {...run, from: run.from - sibling.nodeSize}, true)
    }
    run = run.depth === 0 ? null : getBlockUnitAt(doc, run.from)
  }
  return null
}

export const getTextCaretNear = ($pos: ResolvedPos, dir: 1 | -1 = 1): Selection =>
  Selection.findFrom($pos, dir, true) ??
  Selection.findFrom($pos, -dir, true) ??
  Selection.near($pos, dir)

export const getCaretAfterBlocks = (doc: Node, range: BlockRange) =>
  getTextCaretNear(doc.resolve(range.to), -1)

const getNeighborsOfRun = (doc: Node, range: BlockRange) => {
  const $from = doc.resolve(range.from)
  const $to = doc.resolve(range.to)
  const neighbors: Node[] = []
  for (let depth = range.depth; depth >= 0; depth--) {
    const after = $to.node(depth).maybeChild($to.indexAfter(depth))
    const before = $from.node(depth).maybeChild($from.index(depth) - 1)
    if (after) neighbors.push(after)
    if (before) neighbors.push(before)
  }
  return neighbors
}

export const isRunCollapsedOntoNeighbor = (
  oldDoc: Node,
  oldRange: BlockRange,
  doc: Node,
  range: BlockRange
) => {
  const restored = doc.resolve(range.from).nodeAfter
  if (!restored || restored.nodeSize !== range.to - range.from) return false
  let survived = false
  oldDoc.slice(oldRange.from, oldRange.to).content.forEach((child) => {
    if (child.eq(restored)) survived = true
  })
  return !survived && getNeighborsOfRun(oldDoc, oldRange).some((node) => node.eq(restored))
}

export const copyAsPlainLinks = (fragment: Fragment): Fragment => {
  const children: Node[] = []
  fragment.forEach((child) => {
    if (child.type.name === 'pageLinkBlock' && child.attrs.canonical) {
      children.push(
        child.type.create({...child.attrs, canonical: false}, child.content, child.marks)
      )
    } else {
      children.push(child.isLeaf ? child : child.copy(copyAsPlainLinks(child.content)))
    }
  })
  return Fragment.from(children)
}

export const getAnchorBlockUnit = (state: EditorState): {from: number; to: number} | null => {
  const range = getSelectedBlockRange(state)
  const {doc, selection} = state
  if (!range) {
    return selection instanceof NodeSelection
      ? getBlockRangeAtCaret(state)
      : getBlockUnitAt(doc, selection.anchor)
  }
  if (selection.anchor === range.from) {
    const first = doc.resolve(range.from).nodeAfter
    return first ? {from: range.from, to: range.from + first.nodeSize} : null
  }
  const last = doc.resolve(range.to).nodeBefore
  return last ? {from: range.to - last.nodeSize, to: range.to} : null
}

export const getBlockSelectionAround = (
  state: EditorState,
  from: number,
  to: number
): BlockRange | null => {
  const range = getSelectedBlockRange(state)
  return range && range.from <= from && to <= range.to ? range : null
}

export const selectBlocksThrough = (
  state: EditorState,
  unit: {from: number; to: number}
): Selection | null => {
  const {doc} = state
  const anchor = getAnchorBlockUnit(state)
  const range = getRunFromBoxes(doc, unit, unit, anchor)
  if (!range || !isBlockRun(doc, range)) return null
  return createBlockSelection(doc, range, !!anchor && isRunBackward(range, anchor))
}

export const getDroppedBlockRange = (transactions: readonly Transaction[]): BlockRange | null => {
  const dropIndex = transactions.findIndex((tr) => tr.getMeta('uiEvent') === 'drop')
  const drop = transactions[dropIndex]
  const insertion = drop?.mapping.maps[drop.mapping.maps.length - 1]
  if (!drop || !insertion) return null
  let from = -1
  let to = -1
  insertion.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
    from = newStart
    to = newEnd
  })
  if (from < 0) return null
  const depth = drop.doc.resolve(from).depth
  transactions.slice(dropIndex + 1).forEach((tr) => {
    from = tr.mapping.map(from, 1)
    to = tr.mapping.map(to, -1)
  })
  const doc = transactions[transactions.length - 1]!.doc
  const range = {from, to, depth}
  return isBlockRun(doc, range) ? range : null
}
