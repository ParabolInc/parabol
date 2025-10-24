import type {Extension} from '@hocuspocus/server'
import * as Y from 'yjs'
import type {PageLinkBlockAttributes} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {CipherId} from '../CipherId'
import {handleAddedPageLinks} from './handleAddedPageLinks'
import {handleDeletedPageLinks} from './handleDeletedPageLinks'
import {isTransactionAMovedPageLink} from './isTransactionAMovedPageLink'

const changedPageLinkAttributesAreAMove = (events: Y.YEvent<any>[]) => {
  const newHashes: string[] = []
  const oldHashes: string[] = []
  // changing attributes is only allow in the event of a tiptap-initiated move
  // which looks like A <-> B <-> C
  for (const e of events) {
    const {changes} = e
    const {keys} = changes
    // const target = e.target as Y.XmlElement<PageLinkBlockAttributes>
    if (!isPageLink(e.target) || changes.keys.size === 0) continue
    const changedPageCode = keys.get('pageCode')
    if (!changedPageCode) continue
    const oldPageCode = changedPageCode.oldValue
    const changedCanonical = keys.get('canonical')
    const oldCanonicalVal = changedCanonical
      ? changedCanonical.oldValue
      : e.target.getAttribute('canonical')
    // if the target canonical old val is undefined, that means it's the same value as whatever the new one is
    // if the target canonical new val is undefined
    const newPageCode = e.target.getAttribute('pageCode')
    const newCanonicalVal = e.target.getAttribute('canonical')
    const oldValHash = `${oldPageCode}-${oldCanonicalVal}`
    const newValHash = `${newPageCode}-${newCanonicalVal}`
    oldHashes.push(oldValHash)
    newHashes.push(newValHash)
  }
  if (oldHashes.length === 0) return true
  const movedItem = oldHashes.shift()!
  oldHashes.push(movedItem)
  const isValidMove = oldHashes.every((hash, idx) => hash === newHashes[idx])
  console.log({isValidMove, oldHashes, newHashes})
  return isValidMove
}
const _validate = (events: Y.YEvent<any>[]) => {
  // Changing attributes on a pageLinkBlock is not allowed
  // The exception is TipTap-initiated block moves
  // Given A, B, C -> B, A, C, it runs a series of 3 attribute updates
  // update A with B values, B with C values, C with A values
  const isValidMove = changedPageLinkAttributesAreAMove(events)
  if (isValidMove) return
  // If attributes were updated and it is not a TipTap-initiated move,
  // undo any changes to the canonical & pageCode attrs
  for (const e of events) {
    const {changes} = e
    const {keys} = changes
    const target = e.target as Y.XmlElement<PageLinkBlockAttributes>
    if (e.target.nodeName !== 'pageLinkBlock') continue
    for (const [key, val] of keys) {
      if (key === 'canonical') {
        // pageLinks must be instantiated as canonical, not changed
        const newValue = target.getAttribute('canonical')
        if (newValue) {
          target.setAttribute('canonical', false)
        }
      } else if (key === 'pageCode' && val.oldValue !== -1) {
        target.setAttribute('pageCode', val.oldValue)
      }
    }
  }
}
_validate
export const afterLoadDocument: Extension['afterLoadDocument'] = async ({
  document,
  // DO NOT USE CONTEXT FROM HERE it's just the first user that caused the load on this server,
  documentName
}) => {
  const [pageId] = CipherId.fromClient(documentName)
  const root = document.getXmlFragment('default')

  root.observeDeep((events) => {
    // Ignore any transactions where the page link is "moved" (deleted, then inserted)
    if (isTransactionAMovedPageLink(events)) return
    events.forEach((e) => {
      handleAddedPageLinks(e, pageId)
      handleDeletedPageLinks(e, pageId)
    })
  })
}
