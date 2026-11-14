import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import type Atmosphere from '../../Atmosphere'
import {lookupPageViewerAccess} from '../../hooks/usePageViewerAccess'
import {getBlockSelectionAround} from '../blockSelection/blockSelectionState'
import {type BlockRange, countBlocks} from '../blockSelection/blockUnits'
import type {BlockDragSession} from './blockDragSession'
import {getMovableBlocks} from './getMovableBlocks'
import {trackRange} from './trackRange'

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
  const from = around?.from ?? pos
  const to = around?.to ?? pos + node.nodeSize
  const movable = getMovableBlocks(doc, from, to)
  const unownedChild = movable.childPages.find(({pageCode}) => {
    const role = lookupPageViewerAccess(atmosphere, pageCode)
    return role !== undefined && role !== 'owner'
  })
  const refusal = movable.hasUpload
    ? 'Wait for the upload to finish'
    : unownedChild
      ? `Only its owner can move ${unownedChild.title}`
      : null
  return {
    kind: 'blocks',
    session: {
      editor,
      range: trackRange(editor, from, to),
      sourcePageId: pageId,
      movable,
      count: around ? countBlocks(doc, around) : 1
    },
    refusal,
    selection: around
  }
}
