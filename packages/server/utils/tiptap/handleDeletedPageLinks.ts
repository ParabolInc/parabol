import {sql} from 'kysely'
import * as Y from 'yjs'
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
    const pageCode = getUnsafeDeletedAttribute(node, 'pageCode')
    const isMoving = getUnsafeDeletedAttribute(node, 'isMoving', true)
    const isCanonical = getUnsafeDeletedAttribute(node, 'canonical')
    const pageId = CipherId.decrypt(pageCode)
    if (isCanonical && !isMoving) {
      await Promise.all([
        pg
          .updateTable('Page')
          .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: userId})
          .where('id', '=', pageId)
          .execute(),
        removeAllBacklinkedPageLinkBlocks({pageId})
      ]).catch(Logger.log)
    } else {
      await updateBacklinks(parentPageId, null, pageId).catch(Logger.log)
    }
  })
}
