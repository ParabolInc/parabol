import type {Node} from '@tiptap/pm/model'
import {getSyncedLinkAt} from './getSyncedLinkAt'

export const findSyncedLinkNear = (doc: Node, pos: number, pageCode: number) => {
  let nearest: number | undefined
  doc.descendants((_node, nodePos) => {
    if (!getSyncedLinkAt(doc, nodePos, pageCode)) return true
    if (nearest === undefined || Math.abs(nodePos - pos) < Math.abs(nearest - pos)) {
      nearest = nodePos
    }
    return false
  })
  return nearest
}
