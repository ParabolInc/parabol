import type {Editor} from '@tiptap/core'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {ImageBlock} from './extensions/imageBlock/ImageBlock'
import {ImageUpload} from './extensions/imageUpload/ImageUpload'
import {TaskBlock} from './extensions/insightsBlock/TaskBlock'
import {PageLinkBlock} from './extensions/pageLinkBlock/PageLinkBlock'

const customNodes = [
  TiptapLinkExtension.name,
  PageLinkBlock.name,
  ImageUpload.name,
  ImageBlock.name,
  TaskBlock.name
]

export const isTableGripSelected = (editor: Editor) => {
  const {view, state} = editor
  const {selection} = state
  const {from} = selection
  if (view.isDestroyed) return false // domAtPos will throw if not mounted
  const domAtPos = view.domAtPos(from || 0).node as HTMLElement
  const nodeDOM = view.nodeDOM(from || 0) as HTMLElement
  const node = nodeDOM || domAtPos
  let container = node

  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement!
  }

  const gripColumn =
    container && container.querySelector && container.querySelector('a.grip-column.selected')
  const gripRow =
    container && container.querySelector && container.querySelector('a.grip-row.selected')

  if (gripColumn || gripRow) {
    return true
  }

  return false
}
export const isCustomNodeSelected = (editor: Editor) => {
  return customNodes.some((type) => editor.isActive(type)) || isTableGripSelected(editor)
}
