import type {Editor} from '@tiptap/core'
import {NodeSelection, TextSelection} from '@tiptap/pm/state'
import {
  createBlockSelection,
  getBlockRangeAtCaret,
  getSelectedBlockRange
} from '../blockSelection/blockSelectionState'
import {isBlockUnit} from '../blockSelection/blockUnits'

export const moveBlocksBy = (editor: Editor, direction: 'up' | 'down'): boolean => {
  const {state, view} = editor
  const {doc, selection} = state
  const range = getSelectedBlockRange(state) ?? getBlockRangeAtCaret(state)
  if (!range) return false
  const $from = doc.resolve(range.from)
  const parent = $from.parent
  const endIndex = doc.resolve(range.to).index()
  const neighborIndex = direction === 'up' ? $from.index() - 1 : endIndex
  const neighbor = parent.maybeChild(neighborIndex)
  if (!neighbor || !isBlockUnit(neighbor, parent, neighborIndex)) return true
  const isTrailingEmptyParagraph = (index: number) => {
    const node = parent.maybeChild(index)
    return (
      parent === doc &&
      index === doc.childCount - 1 &&
      node?.type.name === 'paragraph' &&
      node.content.size === 0
    )
  }
  if (isTrailingEmptyParagraph(neighborIndex) || isTrailingEmptyParagraph(endIndex - 1)) return true

  const size = neighbor.nodeSize
  const tr = state.tr
  if (direction === 'up') {
    tr.delete(range.from - size, range.from).insert(range.to - size, neighbor)
  } else {
    tr.delete(range.to, range.to + size).insert(range.from, neighbor)
  }
  const shift = direction === 'up' ? -size : size
  if (getSelectedBlockRange(state)) {
    const shifted = {...range, from: range.from + shift, to: range.to + shift}
    tr.setSelection(createBlockSelection(tr.doc, shifted, selection.head < selection.anchor))
  } else if (selection instanceof NodeSelection) {
    tr.setSelection(NodeSelection.create(tr.doc, selection.from + shift))
  } else {
    const {mapping} = tr
    tr.setSelection(
      TextSelection.create(tr.doc, mapping.map(selection.anchor), mapping.map(selection.head))
    )
  }
  view.dispatch(tr.scrollIntoView())
  return true
}
