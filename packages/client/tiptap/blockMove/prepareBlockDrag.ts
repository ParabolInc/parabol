import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import type Atmosphere from '../../Atmosphere'
import {lookupPageViewerAccess} from '../../hooks/usePageViewerAccess'
import type {BlockDragSession} from './blockDragSession'
import {getMovableBlocks} from './getMovableBlocks'
import {trackRange} from './trackRange'

export type BlockDragPlan =
  | {kind: 'refuse'}
  | {kind: 'page'}
  | {kind: 'blocks'; session: BlockDragSession; refusal: string | null}

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
  if (node.type.name === 'pageLinkBlock' && node.attrs.canonical) return {kind: 'page'}
  const to = pos + node.nodeSize
  const movable = getMovableBlocks(editor.state.doc, pos, to)
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
    session: {editor, range: trackRange(editor, pos, to), sourcePageId: pageId, movable},
    refusal
  }
}
