import {isTransactionOrigin} from '@hocuspocus/server'
import * as Y from 'yjs'
import {getPageLinks} from '../../../client/shared/tiptap/getPageLinks'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import logError from '../logError'
import {canSeePageTitle} from './canSeePageTitle'
import {NEW_PAGE_SENTINEL_CODE} from './constants'
import {createNewPage} from './createNewPage'
import {getUserIdFromTransaction} from './getUserIdFromTransaction'
import {movePageToNewParent} from './movePageToNewParent'
import {updateBacklinks} from './updateBacklinks'

// Backlinks push the linked page's title into this doc, so users may only link pages whose title they may see.
// Server code writes links with no userId; a client connection without one is anonymous
const addBacklink = async (
  transaction: Y.Transaction,
  userId: string | undefined,
  parentPageId: number,
  childPageId: number
) => {
  if (userId) {
    if (!(await canSeePageTitle(userId, childPageId))) return
  } else {
    const {origin} = transaction
    if (isTransactionOrigin(origin) && origin.source === 'connection') return
  }
  await updateBacklinks(parentPageId, childPageId)
}

export const handleAddedPageLinks = (e: Y.YEvent<any>, parentPageId: number) => {
  const {changes, transaction} = e
  const {added} = changes
  const userId = getUserIdFromTransaction(transaction)
  added.forEach(async (item) => {
    const [node] = item.content.getContent()
    if (!isPageLink(node)) return
    const childPageCode = node.getAttribute('pageCode')!
    try {
      if (childPageCode !== NEW_PAGE_SENTINEL_CODE) {
        // if a new PageLink was added to the doc, update the backlinks
        const childPageId = CipherId.decrypt(childPageCode)
        addBacklink(transaction, userId, parentPageId, childPageId).catch(Logger.log)
      }
      if (node.getAttribute('canonical') !== true) return
      if (childPageCode === NEW_PAGE_SENTINEL_CODE) {
        // mint a fresh page and assign it a real pageCode
        const isDatabase = node.getAttribute('database') || false
        const title = node.getAttribute('title')
        const newPage = await createNewPage({
          parentPageId,
          userId: userId!,
          isDatabase,
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: {level: 1},
                content: title ? [{type: 'text', text: title}] : []
              }
            ]
          }
        }).catch(Logger.error)
        if (!newPage) return
        node.setAttribute('pageCode', CipherId.encrypt(newPage.id))
        await updateBacklinks(parentPageId, newPage.id)
      } else {
        // check for duplicates on the same page
        const existingNode = getPageLinks(e.target.doc, true).find(
          (child) => child !== node && child.getAttribute('pageCode') === childPageCode
        )
        if (existingNode) {
          // the viewer is programmatically attempting to inject a second canonical page link
          node.setAttribute('canonical', false)
        } else {
          // a page link either got moved or the viewer is trying to programmatically add one
          // in either case, move the page link from the old parent to new
          // it could also be a cut+paste, where they cut & deleted the page, and pasted in the same or a new page
          try {
            await movePageToNewParent(userId!, CipherId.decrypt(childPageCode), parentPageId)
          } catch (e) {
            Logger.error(e)
            const parent = node.parent
            if (parent instanceof Y.XmlElement) {
              const idxToRemove = parent.toArray().findIndex((child) => child === node)
              parent.delete(idxToRemove)
            }
          }
        }
      }
    } catch (error) {
      logError(error as Error, {userId, extras: {parentPageId, childPageCode}})
    }
  })
}
