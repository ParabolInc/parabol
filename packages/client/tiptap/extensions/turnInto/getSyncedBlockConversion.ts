import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import type {BlockRange} from '../../blockSelection/blockUnits'
import {focusSyncedBlockOnMount} from '../pageLinkBlock/syncedBlockFocus'
import {dispatchBlockConversion} from './dispatchBlockConversion'
import {turnRangeIntoSyncedBlock} from './turnRangeIntoSyncedBlock'

export const getBlockRange = (editor: Editor, node: Node, pos: number): BlockRange | null => {
  const {doc} = editor.state
  if (pos >= doc.content.size || !doc.nodeAt(pos)?.eq(node)) return null
  return {from: pos, to: pos + node.nodeSize, depth: doc.resolve(pos).depth}
}

export const getSyncedBlockConversion = (editor: Editor, range: BlockRange | null) =>
  editor.isEditable && range ? turnRangeIntoSyncedBlock(editor.state, range) : null

export const dispatchSyncedBlockConversion = (
  editor: Editor,
  range: BlockRange | null,
  pos: number
) => {
  const conversion = getSyncedBlockConversion(editor, range)
  if (!conversion) return
  focusSyncedBlockOnMount(conversion.link)
  dispatchBlockConversion(editor, conversion.tr, pos)
}
