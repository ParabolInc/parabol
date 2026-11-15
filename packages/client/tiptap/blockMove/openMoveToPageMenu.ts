import type {Editor} from '@tiptap/core'
import {ReactRenderer} from '@tiptap/react'
import type Atmosphere from '../../Atmosphere'
import type {BlockRange} from '../blockSelection/blockUnits'
import MoveToPageMenu from '../extensions/moveToPage/MoveToPageMenu'
import {moveBlocksToPage} from './moveBlocksToPage'
import {getBlockDragState, prepareBlockMove} from './prepareBlockMove'
import {showBlockMoveSnack} from './showBlockMoveSnack'

export type MoveToPageAnchorRect = {top: number; left: number; width: number; height: number}

type Params = {
  editor: Editor
  range: BlockRange
  anchorRect: MoveToPageAnchorRect
  pageId: string
  atmosphere: Atmosphere
}

let closeOpenMenu: ((returnFocus: boolean) => void) | null = null

export const openMoveToPageMenu = ({editor, range, anchorRect, pageId, atmosphere}: Params) => {
  closeOpenMenu?.(false)
  const {session, refusal} = prepareBlockMove({editor, range, pageId, atmosphere})
  let renderer: ReactRenderer | null = null

  const unmount = () => {
    if (!renderer) return false
    renderer.element.remove()
    renderer.destroy()
    renderer = null
    editor.off('destroy', onEditorDestroy)
    if (closeOpenMenu === cancel) closeOpenMenu = null
    return true
  }

  const onEditorDestroy = () => {
    if (unmount()) session.range.stop()
  }

  const cancel = (returnFocus: boolean) => {
    if (!unmount()) return
    session.range.stop()
    if (returnFocus) editor.commands.focus()
  }

  const pick = (targetPageId: string, targetTitle: string, navigate: (path: string) => void) => {
    if (!unmount()) return
    editor.commands.focus()
    moveBlocksToPage({session, targetPageId, targetTitle})
      .then((outcome) => {
        showBlockMoveSnack({
          atmosphere,
          editor: session.editor,
          navigate,
          outcome,
          count: session.count,
          targetPageId,
          targetTitle
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  renderer = new ReactRenderer(MoveToPageMenu, {
    editor,
    props: {
      anchorRect,
      count: session.count,
      drag: getBlockDragState(session, refusal),
      onClose: cancel,
      onPick: pick
    }
  })
  document.body.appendChild(renderer.element)
  editor.on('destroy', onEditorDestroy)
  closeOpenMenu = cancel
}
