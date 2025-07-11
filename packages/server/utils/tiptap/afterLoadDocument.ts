import type {Extension} from '@hocuspocus/server'
import {sql} from 'kysely'
import * as Y from 'yjs'
import type {PageLinkBlockAttributes} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {movePageToNewParent} from '../../graphql/public/mutations/helpers/movePageToNewParent'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {createChildPage} from './createChildPage'
import {removeBacklinkedPageLinkBlocks} from './hocusPocusHub'

const updateBacklinks = async (
  fromPageId: number,
  addToPageId?: number | null,
  deleteToPageId?: number | null
) => {
  const pg = getKysely()
  await Promise.all([
    addToPageId &&
      pg
        .insertInto('PageBacklink')
        .values({
          toPageId: addToPageId,
          fromPageId
        })
        // conflict possible in a race condition
        .onConflict((oc) => oc.doNothing())
        .execute(),
    deleteToPageId &&
      pg
        .deleteFrom('PageBacklink')
        .where('fromPageId', '=', fromPageId)
        .where('toPageId', '=', deleteToPageId)
        .execute()
  ])
}

const setInitialBacklinks = (pageId: number) => async (e: Y.YXmlEvent) => {
  // this only needs to get called on freshly minted PageLinks because after the pageCode is set
  for (const [key, change] of e.keys) {
    if (key === 'pageCode') {
      const {oldValue} = change
      const newValue = (e.target as Y.XmlElement<PageLinkBlockAttributes>).getAttribute('pageCode')
      const addToPageId = newValue && newValue !== -1 ? CipherId.decrypt(newValue) : null
      const deleteToPageId = oldValue && oldValue !== -1 ? CipherId.decrypt(oldValue) : null
      console.log('updating backlinks from', pageId, {addToPageId, deleteToPageId})
      await updateBacklinks(pageId, addToPageId, deleteToPageId)
    }
  }
}

const handleDeletedPageLink = async (
  userId: string,
  parentPageId: number,
  node: Y.XmlElement<PageLinkBlockAttributes>
) => {
  const pg = getKysely()
  const pageCode = node.getAttribute('pageCode')!
  const pageId = CipherId.decrypt(pageCode)
  const isMoving = node.getAttribute('isMoving') === true
  const isCanonical = node.getAttribute('canonical') === true
  console.log({isMoving})
  if (isCanonical && !isMoving) {
    await Promise.all([
      pg
        .updateTable('Page')
        .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: userId})
        .where('id', '=', pageId)
        .execute(),
      removeBacklinkedPageLinkBlocks({pageId})
    ])
  } else {
    await pg
      .deleteFrom('PageBacklink')
      .where('fromPageId', '=', parentPageId)
      .where('toPageId', '=', pageId)
      .execute()
  }
}

export const afterLoadDocument: Extension['afterLoadDocument'] = async ({
  document,
  context,
  documentName
}) => {
  const [pageId] = CipherId.fromClient(documentName)
  const {userId} = context
  const root = document.getXmlFragment('default')
  root.observe(async (event) => {
    const {added, deleted} = event.changes
    console.log('observe', event.changes.delta, added, deleted)
    added.forEach(async (item) => {
      const [node] = item.content.getContent()
      if (node instanceof Y.XmlElement && node.nodeName === 'pageLinkBlock') {
        const pageLink = node as Y.XmlElement<PageLinkBlockAttributes>
        if (pageLink.getAttribute('canonical') === true) {
          const childPageCode = pageLink.getAttribute('pageCode')!
          if (childPageCode === -1) {
            pageLink.observe(setInitialBacklinks(pageId))
            const newPage = await createChildPage(pageId, userId)
            const pageCode = CipherId.encrypt(newPage.id)
            pageLink.setAttribute('pageCode', pageCode)
          } else {
            // TODO remove the backlink from the old parentPageId & put the backlink on the new one
            await movePageToNewParent(userId, CipherId.decrypt(childPageCode), pageId)
          }
        }
      }
    })
    deleted.forEach((item) => {
      const node = item.content.getContent()
      if (node instanceof Y.XmlElement && node.nodeName === 'pageLinkBlock') {
        handleDeletedPageLink(context.userId, pageId, node)
      }
    })
  })
}
