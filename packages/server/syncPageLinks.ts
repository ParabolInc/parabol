import type {Document} from '@hocuspocus/server'
import type {DirectConnection} from '@hocuspocus/server/dist/packages/server/src/DirectConnection'
import type {JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import * as Y from 'yjs'
import {getPageLinksFromPage} from '../client/shared/tiptap/getPageLinksFromPage'
import {movePageToNewParent} from './graphql/public/mutations/helpers/movePageToNewParent'
import {server} from './hocusPocus'
import getKysely from './postgres/getKysely'
import {CipherId} from './utils/CipherId'
import {NEW_PAGE_SENTINEL_CODE} from './utils/tiptap/constants'
import {createChildPage} from './utils/tiptap/createChildPage'
import {diffByLCS} from './utils/tiptap/diffByLCS'
import {getPageLinkDiffs} from './utils/tiptap/getPageLinkDiffs'
import {removeBacklinkedPageLinkBlocks} from './utils/tiptap/hocusPocusHub'

export const getPageCodeFromLinkKey = (pageLinkKey: string) =>
  Number(pageLinkKey.split(':canonical')[0])

const archiveRemovedPages = (viewerId: string, document: Document, removedPageCodes: number[]) => {
  if (removedPageCodes.length === 0) return undefined
  const metadata = document.getMap('metadata')
  const pendingDeletions = metadata.get('pendingDeletions') as Y.Array<number> | undefined
  if (!pendingDeletions || pendingDeletions.length === 0) return undefined
  const pendingDeletionsArr = pendingDeletions.toArray()
  const pageCodeBatch = removedPageCodes
    // filter out pages that were moved to another page
    .filter((pageCode) => pendingDeletionsArr.includes(pageCode))
  if (pageCodeBatch.length === 0) return undefined
  pageCodeBatch
    // get the index as it exists in the pending deletions
    .map((pageCode) => pendingDeletionsArr.indexOf(pageCode))
    // sorts the indexes from greatest to least because yjs will delete the slot after each delete call
    .toSorted((a, b) => (a < b ? 1 : -1))
    .forEach((idx) => {
      pendingDeletions.delete(idx)
    })

  const pageIdsToDelete = pageCodeBatch.map(CipherId.decrypt)
  return Promise.all([
    getKysely()
      .updateTable('Page')
      .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: viewerId})
      .where('id', 'in', pageIdsToDelete)
      .execute(),
    pageIdsToDelete.map((pageId) => removeBacklinkedPageLinkBlocks({pageId}))
  ])
}

const arePageLinkKeysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

const updateBacklinks = async (
  pageId: number,
  oldPageLinkKeys: string[],
  newPageLinkKeys: string[]
) => {
  const linkKeyRes = getPageLinkDiffs(oldPageLinkKeys, newPageLinkKeys)
  if (!linkKeyRes) return
  const pg = getKysely()
  const {additions, deletions} = linkKeyRes
  await Promise.all([
    additions.length &&
      pg
        .insertInto('PageBacklink')
        .values(
          additions.map((id) => ({
            toPageId: CipherId.decrypt(id),
            fromPageId: pageId
          }))
        )
        // conflict possible in a race condition
        .onConflict((oc) => oc.doNothing())
        .execute(),
    deletions.length &&
      pg
        .deleteFrom('PageBacklink')
        .where('fromPageId', '=', pageId)
        .where('toPageId', 'in', deletions.map(CipherId.decrypt))
        .execute()
  ])
}

const reconcileAddedCanonicalPageLinks = async (
  pageId: number,
  viewerId: string,
  addedPageCodes: number[]
) => {
  if (addedPageCodes.length === 0) return
  const parentPageKey = CipherId.toClient(pageId, 'page')
  let docConnection: DirectConnection | undefined
  await Promise.all(
    addedPageCodes.map(async (childPageCode) => {
      if (childPageCode === NEW_PAGE_SENTINEL_CODE) {
        if (!docConnection) {
          docConnection = await server.openDirectConnection(parentPageKey, {})
        }
        await createChildPage(pageId, viewerId)
      } else {
        // either a new page was just minted, or it came from another page (parent or parentless)
        // if there was an oldParent, this will remove the canonical PageLink on the parent
        // the removal will only be flagged for deletion if it also exists in ydoc.metadata.pendingDeletions
        await movePageToNewParent(viewerId, CipherId.decrypt(childPageCode), pageId)
      }
    })
  )
  if (docConnection) {
    await docConnection.disconnect()
  }
}
const reconcileCanonicalPageLinks = async (
  pageId: number,
  viewerId: string,
  document: Document,
  oldPageLinkKeys: string[],
  newPageLinkKeys: string[]
) => {
  const oldCanonicalLinkCodes = oldPageLinkKeys
    .filter((key) => key.endsWith(':canonical'))
    .map((k) => getPageCodeFromLinkKey(k))
  const newCanonicalLinkCodes = newPageLinkKeys
    .filter((key) => key.endsWith(':canonical'))
    .map((k) => getPageCodeFromLinkKey(k))

  // TODO: if the new has duplicate codes, don't persist
  const childLinkDiffs = diffByLCS(oldCanonicalLinkCodes, newCanonicalLinkCodes)
  if (!childLinkDiffs) return
  await Promise.all([
    reconcileAddedCanonicalPageLinks(pageId, viewerId, childLinkDiffs.added),
    archiveRemovedPages(viewerId, document, childLinkDiffs.removed)
  ])
}

export const syncPageLinks = async (
  viewerId: string,
  pageId: number,
  document: Document,
  content: JSONContent
) => {
  const metadata = document.getMap('metadata')
  const oldPageLinkKeys = (metadata.get('pageLinkKeys') as string[] | undefined) ?? []
  const newPageLinkKeys = getPageLinksFromPage(content)
  // 99% of the time, the update is not about page links, so exit early
  if (arePageLinkKeysEqual(oldPageLinkKeys, newPageLinkKeys)) return
  metadata.set('pageLinkKeys', newPageLinkKeys) // plain JSON array, no CRDT, all-or-nothing updates
  await Promise.all([
    updateBacklinks(pageId, oldPageLinkKeys, newPageLinkKeys),
    reconcileCanonicalPageLinks(pageId, viewerId, document, oldPageLinkKeys, newPageLinkKeys)
  ])
}
