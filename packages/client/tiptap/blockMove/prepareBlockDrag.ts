import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import type Atmosphere from '../../Atmosphere'
import {getBlockSelectionAround} from '../blockSelection/blockSelectionState'
import type {BlockRange} from '../blockSelection/blockUnits'
import type {BlockDragSession} from './blockDragSession'
import {prepareBlockMove} from './prepareBlockMove'

export type BlockDragPlan =
  | {kind: 'refuse'}
  | {kind: 'page'}
  | {
      kind: 'blocks'
      session: BlockDragSession
      refusal: string | null
      selection: BlockRange | null
    }

type Params = {
  editor: Editor
  node: Node
  pos: number
  pageId: string
  atmosphere: Atmosphere
}

export const prepareBlockDrag = ({
  editor,
  node,
  pos,
  pageId,
  atmosphere
}: Params): BlockDragPlan => {
  if (pos === 0) return {kind: 'refuse'}
  const {doc} = editor.state
  const around = getBlockSelectionAround(editor.state, pos, pos + node.nodeSize)
  const isSelectedAlone = around?.from === pos && around.to === pos + node.nodeSize
  const isCanonicalLink = node.type.name === 'pageLinkBlock' && node.attrs.canonical
  if (isCanonicalLink && (!around || isSelectedAlone)) return {kind: 'page'}
  const range: BlockRange = around ?? {
    from: pos,
    to: pos + node.nodeSize,
    depth: doc.resolve(pos).depth
  }
  const {session, refusal} = prepareBlockMove({editor, range, pageId, atmosphere})
  return {kind: 'blocks', session, refusal, selection: around}
}
