import * as Y from 'yjs'
import {createPageLinkElement} from '../../../client/shared/tiptap/createPageLinkElement'
import type {PageLinkBlockAttrs} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {getPageLinks} from '../../../client/shared/tiptap/getPageLinks'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import {pageAccessByUserIdBatchFn} from '../../dataloader/pageAccessByUserIdBatchFn'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import logError from '../logError'
import {getUnsafeDeletedAttribute} from './getUnsafeDeletedAttribute'
import {getUserIdFromTransaction} from './getUserIdFromTransaction'
import {announcePromotedBlock, promoteSyncedBlock} from './promoteSyncedBlock'
import {trashPageUnderParent} from './trashPageUnderParent'
import {updateBacklinks} from './updateBacklinks'

// Someone who cannot trash a sub-page deleted its link, so put the link back where it was
const restorePageLink = async (
  item: Y.Item,
  link: Pick<PageLinkBlockAttrs, 'pageCode' | 'title'>,
  parentPageId: number
) => {
  const {pageCode, title} = link
  const page = await getKysely()
    .selectFrom('Page')
    .select(['parentPageId', 'deletedAt', 'isDatabase', 'isSyncedBlock'])
    .where('id', '=', CipherId.decrypt(pageCode))
    .executeTakeFirst()
  if (!page || page.parentPageId !== parentPageId || page.deletedAt) return
  let anchor = item
  while (anchor.parent instanceof Y.XmlElement && anchor.parent._item?.deleted) {
    anchor = anchor.parent._item
  }
  const {parent} = anchor
  if (!(parent instanceof Y.XmlFragment)) return
  let {left} = anchor
  while (left?.deleted) left = left.left
  const root = parent.doc?.getXmlFragment('default')
  // with nothing left of it in the root, e.g. after the whole page was replaced, append rather than land above the title
  const index = left
    ? parent.toArray().indexOf(left.content.getContent()[0]) + 1
    : parent === root
      ? parent.length
      : 0
  parent.insert(index, [
    createPageLinkElement(pageCode, title, page.isDatabase, page.isSyncedBlock) as Y.XmlElement
  ])
}

const isUnder = (item: Y.Item, root: Y.XmlFragment) => {
  let {parent} = item
  while (parent instanceof Y.AbstractType) {
    if (parent === root) return true
    parent = parent._item?.parent ?? null
  }
  return false
}

const getDeletedPageLinkItems = (transaction: Y.Transaction, root: Y.XmlFragment) => {
  const items: {item: Y.Item; node: Y.XmlElement<PageLinkBlockAttrs>}[] = []
  Y.iterateDeletedStructs(transaction, transaction.deleteSet, (struct) => {
    if (!(struct instanceof Y.Item)) return
    if (!(struct.content instanceof Y.ContentType)) return
    const node = struct.content.type
    if (!isPageLink(node)) return
    if (struct.id.clock >= (transaction.beforeState.get(struct.id.client) ?? 0)) return
    if (!isUnder(struct, root)) return
    items.push({item: struct, node})
  })
  return items
}

const handledTransactions = new WeakSet<Y.Transaction>()

export const handleDeletedPageLinks = (e: Y.YEvent<any>, parentPageId: number) => {
  const {transaction} = e
  if (handledTransactions.has(transaction)) return
  handledTransactions.add(transaction)
  const userId = getUserIdFromTransaction(transaction)
  const pg = getKysely()
  const root = transaction.doc.getXmlFragment('default')
  getDeletedPageLinkItems(transaction, root).forEach(async ({item, node}) => {
    try {
      const isMoving = getUnsafeDeletedAttribute(node, 'isMoving', true)
      // don't delete it here, it'll get removed as a side effect when it gets added to its new page
      if (isMoving) return
      const pageCode = getUnsafeDeletedAttribute(node, 'pageCode')
      const isCanonical = getUnsafeDeletedAttribute(node, 'canonical')
      // deleted attributes are garbage collected after this transaction, so read them before awaiting
      const title = getUnsafeDeletedAttribute(node, 'title', true)
      const isSynced = getUnsafeDeletedAttribute(node, 'synced', true) === true
      const pageId = CipherId.decrypt(pageCode)

      // there could be multiple non-canonicals
      const existingSimilarNode = getPageLinks(transaction.doc, isCanonical).find(
        (child) => child !== node && child.getAttribute('pageCode') === pageCode
      )
      const isLinkedElsewhereHere = getPageLinks(transaction.doc).some(
        (child) => child !== node && child.getAttribute('pageCode') === pageCode
      )

      if (!existingSimilarNode) {
        if (isCanonical && isSynced) {
          const remainingCopy = getPageLinks(transaction.doc, false).find(
            (child) =>
              child.getAttribute('pageCode') === pageCode && child.getAttribute('synced') === true
          )
          if (remainingCopy) {
            remainingCopy.setAttribute('canonical', true)
            return
          }
        }
        // detecting true deletes is HARD
        // moves look like
        // - a delete/add
        // - delete/add a different item/change attributes
        // The most certain way to see if verify that it no longer exists
        await updateBacklinks(parentPageId, null, pageId).catch(Logger.log)
        if (!isCanonical) {
          if (!isSynced || isLinkedElsewhereHere) return
          const block = await pg
            .selectFrom('Page')
            .select('parentPageId')
            .where('id', '=', pageId)
            .executeTakeFirst()
          if (block?.parentPageId !== parentPageId) return
        }
        if (isSynced) {
          const promotedHostId = await pg
            .transaction()
            .execute((trx) => promoteSyncedBlock(trx, pageId, [parentPageId]))
          if (promotedHostId !== null) {
            await announcePromotedBlock(promotedHostId, pageId, [parentPageId], userId ?? null)
            return
          }
        }
        // Any editor can write a canonical link into a doc, so archive only what archivePage would allow:
        // the page's owner removing the link from the page it actually lives under
        const [viewerAccess] = userId ? await pageAccessByUserIdBatchFn([{pageId, userId}]) : []
        if (viewerAccess !== 'owner') {
          await restorePageLink(item, {pageCode, title}, parentPageId)
          return
        }
        await trashPageUnderParent(pageId, parentPageId, userId ?? null)
      }
    } catch (error) {
      logError(error as Error, {userId, extras: {parentPageId}})
    }
  })
}
