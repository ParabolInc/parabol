import type {Extension} from '@hocuspocus/server'
import {sql} from 'kysely'
import * as Y from 'yjs'
import type {PageLinkBlockAttributes} from '../../../client/shared/tiptap/extensions/PageLinkBlockBase'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import {NEW_PAGE_SENTINEL_CODE} from './constants'
import {createChildPage} from './createChildPage'
import {removeBacklinkedPageLinkBlocks} from './hocusPocusHub'
import {movePageToNewParent} from './movePageToNewParent'

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
      removeBacklinkedPageLinkBlocks({pageId})
    ])
  } else {
    await updateBacklinks(parentPageId, null, pageId)
  }
}

export const afterLoadDocument: Extension['afterLoadDocument'] = async ({
  document,
  // DO NOT USE CONTEXT FROM HERE it's just the first user that caused the load on this server,
  documentName
}) => {
  const [pageId] = CipherId.fromClient(documentName)
  const root = document.getXmlFragment('default')
  // FIXME: this gets called once per document load & the context is tied to the user, which it should not be
  // Also, we don't want 2 servers doing the same thing...

  const nonCanonlinkObserver = (e: Y.YXmlEvent) => {
    // observe all links to make sure client does not change pageCode or canonical values
    // technically we should monitor canonical links to make sure they don't change the pageCode
    for (const [key, val] of e.keys) {
      if (key === 'canonical') {
        const target = e.target as Y.XmlElement<PageLinkBlockAttributes>
        const newValue = target.getAttribute('canonical')
        if (newValue) {
          target.setAttribute('canonical', false)
        }
      } else if (key === 'pageCode' && val.oldValue !== -1) {
        const target = e.target as Y.XmlElement<PageLinkBlockAttributes>
        target.setAttribute('pageCode', val.oldValue)
      }
    }
  }
  root
    .toArray()
    .filter(
      (n): n is Y.XmlElement =>
        n instanceof Y.XmlElement &&
        n.nodeName === 'pageLinkBlock' &&
        n.getAttribute('canonical') === (false as any)
    )
    .forEach((link) => link.observe(nonCanonlinkObserver))

  root.observe(async (event) => {
    const {changes, transaction} = event
    const {added, deleted} = changes
    const userId = transaction.origin?.context?.userId
    // watch for new PageLinks
    // If it's a sentinel, mint a new page
    // Then, add it to the backlinks table
    // If it's canonical, update its parentPageId + access
    added.forEach(async (item) => {
      try {
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
                    const newValue = (
                      e.target as Y.XmlElement<PageLinkBlockAttributes>
                    ).getAttribute('pageCode')
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
              // check for duplicates on the same page
              const existingNode = root
                .toArray()
                .filter(
                  (n): n is Y.XmlElement =>
                    n instanceof Y.XmlElement && n.nodeName === 'pageLinkBlock' && n !== pageLink
                )
                .map((item) => item.getAttributes() as any as PageLinkBlockAttributes)
                .find((attr) => attr.pageCode === childPageCode && attr.canonical === true)
              if (existingNode) {
                // the viewer is programmatically attempting to inject a second canonical page link
                pageLink.setAttribute('canonical', false)
                pageLink.observe(nonCanonlinkObserver)
              } else {
                // a page link either got moved or the viewer is trying to programmatically add one
                // in either case, move the page link from the old parent to new
                await movePageToNewParent(userId, CipherId.decrypt(childPageCode), pageId)
              }
            }
          } else {
            // make sure a client doesn't try to convert a non-canonical link to canonical. Only 1 can exist
            pageLink.observe(nonCanonlinkObserver)
          }
        }
      } catch (e) {
        // We may want to delete the node if this fails
        Logger.error(e)
      }
    })
    // If a removed PageLink is canonical, remove it from all backlinked docs & archive it
    // Else, remove its backlink
    deleted.forEach((item) => {
      const [node] = item.content.getContent()
      if (node instanceof Y.XmlElement && node.nodeName === 'pageLinkBlock') {
        handleDeletedPageLink(userId, pageId, node)
      }
    })
  })
}

// XML attributes are stored as a yMap, which gets deleted when the element is deleted
// This uses the undocumented internal yjs _map structure to access those attributes
// It SHOULD be stable until GC, as long as it's called synchronously in the observer callback
const getUnsafeDeletedAttribute = (
  node: Y.XmlElement<PageLinkBlockAttributes>,
  attr: string,
  isOptional?: boolean
) => {
  const attrMapEntry = node._map?.get(attr)
  if (!attrMapEntry) {
    if (!isOptional) {
      console.error(`[getUnsafeDeletedAttribute]: missing map entry ${attr}`)
    }
    return attrMapEntry
  }
  const val = attrMapEntry.content.getContent()[0]
  if (val === undefined) {
    console.error('[getUnsafeDeletedAttribute]: map entry value is undefined')
  }
  return val
}
