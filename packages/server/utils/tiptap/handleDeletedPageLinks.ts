import {sql} from 'kysely'
import * as Y from 'yjs'
import {getPageLinks} from '../../../client/shared/tiptap/getPageLinks'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import {getUnsafeDeletedAttribute} from './getUnsafeDeletedAttribute'
import {removeAllBacklinkedPageLinkBlocks} from './hocusPocusHub'
import {updateBacklinks} from './updateBacklinks'

export const handleDeletedPageLinks = (e: Y.YEvent<any>, parentPageId: number) => {
  const {changes, transaction} = e
  const {deleted} = changes
  const userId = transaction.origin?.context?.userId
  const pg = getKysely()
  deleted.forEach(async (item) => {
    const [node] = item.content.getContent()
    if (!isPageLink(node)) return
    const isMoving = getUnsafeDeletedAttribute(node, 'isMoving')
    // don't delete it here, it'll get removed as a side effect when it gets added to its new page
    if (isMoving) return
    const pageCode = getUnsafeDeletedAttribute(node, 'pageCode')
    const isCanonical = getUnsafeDeletedAttribute(node, 'canonical')
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
      if (isCanonical) {
        await Promise.all([
          pg
            .updateTable('Page')
            .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: userId})
            .where('id', '=', pageId)
            .execute(),
          removeAllBacklinkedPageLinkBlocks({pageId})
        ]).catch(Logger.log)
      }
    }
  })
}
