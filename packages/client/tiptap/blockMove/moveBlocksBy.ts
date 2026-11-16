import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {NodeSelection, TextSelection, type Transaction} from '@tiptap/pm/state'
import {
  createBlockSelection,
  getBlockRangeAtCaret,
  getSelectedBlockRange,
  isBlockRun
} from '../blockSelection/blockSelectionState'
import {type BlockRange, isBlockUnit} from '../blockSelection/blockUnits'

type Direction = 'up' | 'down'

const findNeighbor = (doc: Node, range: BlockRange, direction: Direction) => {
  if (!isBlockRun(doc, range)) return null
  const $from = doc.resolve(range.from)
  const parent = $from.parent
  const endIndex = doc.resolve(range.to).index()
  const neighborIndex = direction === 'up' ? $from.index() - 1 : endIndex
  const neighbor = parent.maybeChild(neighborIndex)
  if (!neighbor || !isBlockUnit(neighbor, parent, neighborIndex)) return null
  const isTrailingEmptyParagraph = (index: number) => {
    const node = parent.maybeChild(index)
    return (
      parent === doc &&
      index === doc.childCount - 1 &&
      node?.type.name === 'paragraph' &&
      node.content.size === 0
    )
  }
  if (isTrailingEmptyParagraph(neighborIndex) || isTrailingEmptyParagraph(endIndex - 1)) return null
  return neighbor
}

const swapWithNeighbor = (
  tr: Transaction,
  range: BlockRange,
  neighbor: Node,
  direction: Direction
): BlockRange => {
  const size = neighbor.nodeSize
  if (direction === 'up') {
    tr.delete(range.from - size, range.from).insert(range.to - size, neighbor)
  } else {
    tr.delete(range.to, range.to + size).insert(range.from, neighbor)
  }
  const shift = direction === 'up' ? -size : size
  return {...range, from: range.from + shift, to: range.to + shift}
}

export const canMoveBlockRange = (doc: Node, range: BlockRange, direction: Direction) =>
  !!findNeighbor(doc, range, direction)

export const moveBlockRange = (editor: Editor, range: BlockRange, direction: Direction) => {
  const {state, view} = editor
  const neighbor = findNeighbor(state.doc, range, direction)
  if (!neighbor) return false
  const tr = state.tr
  const moved = swapWithNeighbor(tr, range, neighbor, direction)
  tr.setSelection(createBlockSelection(tr.doc, moved))
  view.dispatch(tr.scrollIntoView())
  return true
}

export const moveBlocksBy = (editor: Editor, direction: Direction): boolean => {
  const {state, view} = editor
  const {doc, selection} = state
  const selectedRange = getSelectedBlockRange(state)
  const range = selectedRange ?? getBlockRangeAtCaret(state)
  if (!range) return false
  const neighbor = findNeighbor(doc, range, direction)
  if (!neighbor) return true

  const tr = state.tr
  const moved = swapWithNeighbor(tr, range, neighbor, direction)
  if (selectedRange) {
    tr.setSelection(createBlockSelection(tr.doc, moved, selection.head < selection.anchor))
  } else if (selection instanceof NodeSelection) {
    tr.setSelection(NodeSelection.create(tr.doc, selection.from + moved.from - range.from))
  } else {
    const {mapping} = tr
    tr.setSelection(
      TextSelection.create(tr.doc, mapping.map(selection.anchor), mapping.map(selection.head))
    )
  }
  view.dispatch(tr.scrollIntoView())
  return true
}
