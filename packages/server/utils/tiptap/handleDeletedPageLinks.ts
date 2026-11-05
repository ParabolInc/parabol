import {sql} from 'kysely'
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
import {removeAllBacklinkedPageLinkBlocks} from './hocusPocusHub'
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
    .select(['parentPageId', 'deletedAt', 'isDatabase'])
    .where('id', '=', CipherId.decrypt(pageCode))
    .executeTakeFirst()
  if (!page || page.parentPageId !== parentPageId || page.deletedAt) return
  const {parent} = item
  if (!(parent instanceof Y.XmlFragment)) return
  let {left} = item
  while (left?.deleted) left = left.left
  // with nothing left of it, e.g. after the whole page was replaced, append rather than land above the title
  const index = left ? parent.toArray().indexOf(left.content.getContent()[0]) + 1 : parent.length
  parent.insert(index, [createPageLinkElement(pageCode, title, page.isDatabase) as Y.XmlElement])
}

export const handleDeletedPageLinks = (e: Y.YEvent<any>, parentPageId: number) => {
  const {changes, transaction} = e
  const {deleted} = changes
  const userId = getUserIdFromTransaction(transaction)
  const pg = getKysely()
  deleted.forEach(async (item) => {
    try {
      const [node] = item.content.getContent()
      if (!isPageLink(node)) return
      const isMoving = getUnsafeDeletedAttribute(node, 'isMoving', true)
      // don't delete it here, it'll get removed as a side effect when it gets added to its new page
      if (isMoving) return
      const pageCode = getUnsafeDeletedAttribute(node, 'pageCode')
      const isCanonical = getUnsafeDeletedAttribute(node, 'canonical')
      // deleted attributes are garbage collected after this transaction, so read them before awaiting
      const title = getUnsafeDeletedAttribute(node, 'title', true)
      const pageId = CipherId.decrypt(pageCode)

      // there could be multiple non-canonicals
      const existingSimilarNode = getPageLinks(e.target.doc, isCanonical).find(
        (child) => child !== node && child.getAttribute('pageCode') === pageCode
      )

      if (!existingSimilarNode) {
        // detecting true deletes is HARD
        // moves look like
        // - a delete/add
        // - delete/add a different item/change attributes
        // The most certain way to see if verify that it no longer exists
        await updateBacklinks(parentPageId, null, pageId).catch(Logger.log)
        if (!isCanonical) return
        // Any editor can write a canonical link into a doc, so archive only what archivePage would allow:
        // the page's owner removing the link from the page it actually lives under
        const [viewerAccess] = userId ? await pageAccessByUserIdBatchFn([{pageId, userId}]) : []
        if (viewerAccess !== 'owner') {
          await restorePageLink(item, {pageCode, title}, parentPageId)
          return
        }
        const {numUpdatedRows} = await pg
          .updateTable('Page')
          .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: userId})
          .where('id', '=', pageId)
          .where('parentPageId', '=', parentPageId)
          .executeTakeFirst()
        if (numUpdatedRows === 0n) return
        await removeAllBacklinkedPageLinkBlocks({pageId})
      }
    } catch (error) {
      logError(error as Error, {userId, extras: {parentPageId}})
    }
  })
}
