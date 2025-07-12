import type {Extension} from '@hocuspocus/server'
import {sql} from 'kysely'
import * as Y from 'yjs'
import type {PageLinkBlockAttributes} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import {movePageToNewParent} from '../../graphql/public/mutations/helpers/movePageToNewParent'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {NEW_PAGE_SENTINEL_CODE} from './constants'
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

const handleDeletedPageLink = async (
  userId: string,
  parentPageId: number,
  node: Y.XmlElement<PageLinkBlockAttributes>
) => {
  const pg = getKysely()
  const pageCode = getUnsafeDeletedAttribute(node, 'pageCode')
  const isMoving = getUnsafeDeletedAttribute(node, 'isMoving')
  const isCanonical = getUnsafeDeletedAttribute(node, 'canonical')
  const pageId = CipherId.decrypt(pageCode)
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
    await updateBacklinks(parentPageId, null, pageId)
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
    // watch for new PageLinks
    // If it's a sentinel, mint a new page
    // Then, add it to the backlinks table
    // If it's canonical, update its parentPageId + access
    added.forEach(async (item) => {
      const [node] = item.content.getContent()
      if (node instanceof Y.XmlElement && node.nodeName === 'pageLinkBlock') {
        const pageLink = node as Y.XmlElement<PageLinkBlockAttributes>
        const childPageCode = pageLink.getAttribute('pageCode')!
        if (childPageCode !== NEW_PAGE_SENTINEL_CODE) {
          // if a new PageLink was added to the doc, update the backlinks
          const childPageId = CipherId.decrypt(childPageCode)
          updateBacklinks(pageId, childPageId)
        }
        if (pageLink.getAttribute('canonical') === true) {
          if (childPageCode === NEW_PAGE_SENTINEL_CODE) {
            // mint a fresh page and assign it a real pageCode
            const observer = async (e: Y.YXmlEvent) => {
              pageLink.unobserve(observer)
              // this only needs to get called on freshly minted PageLinks because after the pageCode is set
              for (const [key] of e.keys) {
                if (key === 'pageCode') {
                  const newValue = (e.target as Y.XmlElement<PageLinkBlockAttributes>).getAttribute(
                    'pageCode'
                  )
                  const addToPageId =
                    newValue && newValue !== NEW_PAGE_SENTINEL_CODE
                      ? CipherId.decrypt(newValue)
                      : null
                  if (addToPageId) {
                    await updateBacklinks(pageId, addToPageId)
                  }
                }
              }
            }
            pageLink.observe(observer)
            const newPage = await createChildPage(pageId, userId)
            const pageCode = CipherId.encrypt(newPage.id)
            pageLink.setAttribute('pageCode', pageCode)
          } else {
            await movePageToNewParent(userId, CipherId.decrypt(childPageCode), pageId)
          }
        }
      }
    })
    // If a removed PageLink is canonical, remove it from all backlinked docs & archive it
    // Else, remove its backlink
    deleted.forEach((item) => {
      const [node] = item.content.getContent()
      if (node instanceof Y.XmlElement && node.nodeName === 'pageLinkBlock') {
        handleDeletedPageLink(context.userId, pageId, node)
      }
    })
  })
}

// XML attributes are stored as a yMap, which gets deleted when the element is deleted
// This uses the undocumented internal yjs _map structure to access those attributes
// It SHOULD be stable until GC, as long as it's called synchronously in the observer callback
const getUnsafeDeletedAttribute = (node: Y.XmlElement<PageLinkBlockAttributes>, attr: string) => {
  const attrMapEntry = node._map?.get(attr)
  if (!attrMapEntry) {
    console.error('[getUnsafeDeletedAttribute]: missing map entry')
    return
  }
  const val = attrMapEntry.content.getContent()[0]
  if (val === undefined) {
    console.error('[getUnsafeDeletedAttribute]: map entry value is undefined')
  }
  return val
}
