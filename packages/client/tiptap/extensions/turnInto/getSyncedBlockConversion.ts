import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {getSelectedBlockRange} from '../../blockSelection/blockSelectionState'
import {turnRangeIntoSyncedBlock} from './turnRangeIntoSyncedBlock'

const getBlockRange = (editor: Editor, node: Node, pos: number) => {
  const {doc} = editor.state
  if (pos >= doc.content.size || !doc.nodeAt(pos)?.eq(node)) return null
  return {from: pos, to: pos + node.nodeSize, depth: doc.resolve(pos).depth}
}

export const getSyncedBlockConversion = (
  editor: Editor,
  node: Node,
  pos: number,
  isSelection: boolean
) => {
  if (!editor.isEditable) return null
  const range = isSelection ? getSelectedBlockRange(editor.state) : getBlockRange(editor, node, pos)
  return range ? turnRangeIntoSyncedBlock(editor.state, range) : null
}
