import type {Editor} from '@tiptap/core'
import {ReactRenderer} from '@tiptap/react'
import type {MoveToPageAnchorRect} from '../../blockMove/openMoveToPageMenu'
import CopyToPageMenu from './CopyToPageMenu'

type Params = {
  editor: Editor
  anchorRect: MoveToPageAnchorRect
  pageCode: number
  title: string
}

let closeOpenMenu: ((returnFocus: boolean) => void) | null = null

export const openCopyToPageMenu = ({editor, anchorRect, pageCode, title}: Params) => {
  closeOpenMenu?.(false)
  let renderer: ReactRenderer | null = null

  const unmount = () => {
    if (!renderer) return false
    renderer.element.remove()
    renderer.destroy()
    renderer = null
    editor.off('destroy', onEditorDestroy)
    if (closeOpenMenu === close) closeOpenMenu = null
    return true
  }

  const onEditorDestroy = () => {
    unmount()
  }

  const close = (returnFocus: boolean) => {
    if (!unmount()) return
    if (returnFocus) editor.commands.focus()
  }

  renderer = new ReactRenderer(CopyToPageMenu, {
    editor,
    props: {
      anchorRect,
      pageCode,
      title,
      onClose: close
    }
  })
  document.body.appendChild(renderer.element)
  editor.on('destroy', onEditorDestroy)
  closeOpenMenu = close
}
