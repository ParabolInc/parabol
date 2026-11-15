import type {Editor} from '@tiptap/core'
import type Atmosphere from '../../Atmosphere'
import {lookupPageViewerAccess} from '../../hooks/usePageViewerAccess'
import {GQLID} from '../../utils/GQLID'
import {type BlockRange, countBlocks} from '../blockSelection/blockUnits'
import type {BlockDragSession} from './blockDragSession'
import type {BlockDragState} from './getBlockDropRefusal'
import {getMovableBlocks} from './getMovableBlocks'
import {trackRange} from './trackRange'

type Params = {
  editor: Editor
  range: BlockRange
  pageId: string
  atmosphere: Atmosphere
}

export const prepareBlockMove = ({editor, range, pageId, atmosphere}: Params) => {
  const {doc} = editor.state
  const movable = getMovableBlocks(doc, range.from, range.to)
  const unownedChild = movable.childPages.find(({pageCode}) => {
    const role = lookupPageViewerAccess(atmosphere, pageCode)
    return role !== undefined && role !== 'owner'
  })
  const refusal = movable.hasUpload
    ? 'Wait for the upload to finish'
    : unownedChild
      ? `Only its owner can move ${unownedChild.title}`
      : null
  const session: BlockDragSession = {
    editor,
    range: trackRange(editor, range.from, range.to),
    sourcePageId: pageId,
    movable,
    count: countBlocks(doc, range)
  }
  return {session, refusal}
}

export const getBlockDragState = (
  session: BlockDragSession,
  refusal: string | null
): BlockDragState => ({
  sourcePageId: session.sourcePageId,
  childPageIds: session.movable.childPages.map(({pageCode}) => GQLID.toKey(pageCode, 'page')),
  refusal
})
