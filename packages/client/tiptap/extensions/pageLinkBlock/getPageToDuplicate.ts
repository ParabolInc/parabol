import {isNodeRangeSelection} from '@tiptap/extension-node-range'
import type {Node} from '@tiptap/pm/model'
import {type EditorState, NodeSelection} from '@tiptap/pm/state'

type DuplicateTarget = {pos: number} | {selection: true}

const getTargetNode = (state: EditorState, target: DuplicateTarget): Node | null => {
  if ('pos' in target) return state.doc.nodeAt(target.pos)
  const {selection} = state
  if (isNodeRangeSelection(selection)) return null
  if (selection instanceof NodeSelection) return selection.node
  const {$from} = selection
  return $from.depth < 1 ? null : $from.node(1)
}

export const getPageToDuplicate = (state: EditorState, target: DuplicateTarget) => {
  const node = getTargetNode(state, target)
  if (node?.type.name !== 'pageLinkBlock') return null
  const {canonical, synced, pageCode, title} = node.attrs
  const code = Number(pageCode)
  if (canonical !== true || synced || !Number.isInteger(code) || code <= 0) return null
  return {pageCode: code, title: typeof title === 'string' ? title : ''}
}
