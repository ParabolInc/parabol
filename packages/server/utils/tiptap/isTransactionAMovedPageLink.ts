import * as Y from 'yjs'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {getUnsafeDeletedAttribute} from './getUnsafeDeletedAttribute'

export const isTransactionAMovedPageLink = (events: Y.YEvent<any>[]) => {
  let addedPageHash = ''
  let deletedPageHash = ''
  for (const e of events) {
    const {changes, target} = e
    const {added, deleted, keys} = changes
    for (const item of added) {
      const [node] = item.content.getContent()
      if (!isPageLink(node)) continue
      if (addedPageHash) return false
      const pageCode = node.getAttribute('pageCode')!
      const canonical = node.getAttribute('canonical')
      addedPageHash = `${pageCode}:${!!canonical}`
    }
    for (const item of deleted) {
      const [node] = item.content.getContent()
      if (deletedPageHash) return false
      const pageCode = getUnsafeDeletedAttribute(node, 'pageCode')
      const canonical = getUnsafeDeletedAttribute(node, 'canonical')
      deletedPageHash = `${pageCode}:${!!canonical}`
    }
    if (addedPageHash && keys.size) {
      const pageCode = keys.get('pageCode')?.oldValue ?? null
      const canonical = keys.get('canonical')?.oldValue ?? target.getAttribute('canonical')
      const changedHash = `${pageCode}:${!!canonical}`
      if (changedHash === addedPageHash) {
        const pageCode = target.getAttribute('pageCode')!
        const canonical = target.getAttribute('canonical')
        addedPageHash = `${pageCode}:${!!canonical}`
      }
    }
  }
  return addedPageHash === deletedPageHash
}
