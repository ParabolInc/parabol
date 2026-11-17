import type {Editor} from '@tiptap/core'
import {ySyncPluginKey} from '@tiptap/y-tiptap'
import type * as Y from 'yjs'
import type {MovedBlock} from './appendBlocksToFragment'

export const findMovedBlockPositions = (editor: Editor, moved: readonly MovedBlock[]) => {
  const binding = ySyncPluginKey.getState(editor.state)?.binding
  if (!binding) return []
  const movedNodes = new Set<unknown>()
  binding.type.toArray().forEach((yElement: Y.XmlElement | Y.XmlText | Y.XmlHook) => {
    const id = yElement._item?.id
    if (!id) return
    if (!moved.some((block) => block.client === id.client && block.clock === id.clock)) return
    const node = binding.mapping.get(yElement)
    if (node) movedNodes.add(node)
  })
  const positions: number[] = []
  editor.state.doc.forEach((node, offset) => {
    if (movedNodes.has(node)) positions.push(offset)
  })
  return positions
}
