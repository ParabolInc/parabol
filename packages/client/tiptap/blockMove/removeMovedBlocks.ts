import * as Y from 'yjs'
import type {MovedBlock} from './appendBlocksToFragment'
import {blockSnapshot, holdsChildPageLink} from './blockSnapshot'
import {findYItem} from './findYItem'

export const removeMovedBlocks = (
  frag: Y.XmlFragment,
  moved: readonly MovedBlock[],
  keptPageCodes: ReadonlySet<number> = new Set()
) => {
  const doc = frag.doc
  if (!doc) return {removed: 0, kept: moved.length}
  let removed = 0
  let kept = 0
  doc.transact(() => {
    moved.forEach(({client, clock, snapshot}) => {
      const item = findYItem(doc, client, clock)
      if (!item || item.deleted) {
        removed++
        return
      }
      if (item.parent !== frag) {
        kept++
        return
      }
      const element = item.content.getContent()[0]
      if (
        !(element instanceof Y.XmlElement) ||
        blockSnapshot(element) !== snapshot ||
        holdsChildPageLink(element, keptPageCodes)
      ) {
        kept++
        return
      }
      const index = frag.toArray().indexOf(element)
      frag.delete(index, 1)
      removed++
    })
  })
  return {removed, kept}
}
