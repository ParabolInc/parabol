import * as Y from 'yjs'
import type {MovedBlock} from './appendBlocksToFragment'
import type {StackItem} from './blockMoveUndoStack'
import {findYItem} from './findYItem'

export const collectRestored = (doc: Y.Doc, stackItem: StackItem) => {
  const restored: MovedBlock[] = []
  stackItem.insertions.clients.forEach((ranges, client) => {
    ranges.forEach(({clock, len}) => {
      for (let at = clock; at < clock + len; ) {
        const item = findYItem(doc, client, at)
        if (!item) return
        at = item.id.clock + item.length
        if (item.deleted || !(item.content instanceof Y.ContentType)) continue
        const parentItem = item.parent instanceof Y.AbstractType ? item.parent._item : null
        if (parentItem && Y.isDeleted(stackItem.insertions, parentItem.id)) continue
        restored.push({client, clock: item.id.clock, snapshot: item.content.type.toString()})
      }
    })
  })
  return restored
}

export const isRestoredEdited = (doc: Y.Doc, restored: readonly MovedBlock[]) =>
  restored.some(({client, clock, snapshot}) => {
    const item = findYItem(doc, client, clock)
    if (!item || item.deleted) return false
    return !(item.content instanceof Y.ContentType) || item.content.type.toString() !== snapshot
  })
