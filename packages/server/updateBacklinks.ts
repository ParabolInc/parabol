import type {Document} from '@hocuspocus/server'
import type {JSONContent} from '@tiptap/core'
import {sql} from 'kysely'
import {positionAfter, positionBefore, positionBetween} from '../client/shared/sortOrder'
import {getPageLinksFromPage} from '../client/shared/tiptap/getPageLinksFromPage'
import getKysely from './postgres/getKysely'
import {CipherId} from './utils/CipherId'
import {diffByLCS, type LCSDiffResult} from './utils/tiptap/diffByLCS'
import {getPageLinkDiffs} from './utils/tiptap/getPageLinkDiffs'
import {removeBacklinkedPageLinkBlocks} from './utils/tiptap/hocusPocusHub'

export const getPageCodeFromLinkKey = (pageLinkKey: string) =>
  Number(pageLinkKey.split(':canonical')[0])

const archiveRemovedPages = (viewerId: string, removedPageIds: number[]) => {
  if (removedPageIds.length === 0) return undefined
  return Promise.all([
    getKysely()
      .updateTable('Page')
      .set({deletedAt: sql`CURRENT_TIMESTAMP`, deletedBy: viewerId})
      .where('id', 'in', removedPageIds)
      .execute(),
    removedPageIds.map((pageId) => removeBacklinkedPageLinkBlocks({pageId}))
  ])
}

const getSortOrder = async (toIndex: number, newChildPageIds: number[]) => {
  const beforeId = newChildPageIds[toIndex - 1]
  const afterId = newChildPageIds[toIndex + 1]
  const pg = getKysely()
  const [prevPage, nextPage] = await Promise.all([
    !beforeId
      ? undefined
      : pg.selectFrom('Page').select('sortOrder').where('id', '=', beforeId).executeTakeFirst(),
    !afterId
      ? undefined
      : pg.selectFrom('Page').select('sortOrder').where('id', '=', afterId).executeTakeFirst()
  ])
  if (prevPage && nextPage) return positionBetween(prevPage.sortOrder, nextPage.sortOrder)
  if (prevPage) return positionAfter(prevPage.sortOrder)
  if (nextPage) return positionBefore(nextPage.sortOrder)
  return '!'
}

const updatePageSortOrderOnMove = async (
  moved: LCSDiffResult<number>['moved'],
  newChildPageIds: number[]
) => {
  if (moved.length === 0) return undefined
  const pg = getKysely()
  return Promise.all(
    moved.map(async (item) => {
      const sortOrder = await getSortOrder(item.toIndex, newChildPageIds)
      return pg.updateTable('Page').set({sortOrder}).where('id', '=', item.id).execute()
    })
  )
}

const arePageLinkKeysEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export const updateBacklinks = async (
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
  const pg = getKysely()
  const linkKeyRes = getPageLinkDiffs(oldPageLinkKeys, newPageLinkKeys)
  if (linkKeyRes) {
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
  const oldAutoLinkCodes = oldPageLinkKeys
    .filter((key) => key.endsWith(':canonical'))
    .map((k) => CipherId.decrypt(getPageCodeFromLinkKey(k)))
  const newAutoLinkCodes = newPageLinkKeys
    .filter((key) => key.endsWith(':canonical'))
    .map((k) => CipherId.decrypt(getPageCodeFromLinkKey(k)))
  const childLinkDiffs = diffByLCS(oldAutoLinkCodes, newAutoLinkCodes)
  if (childLinkDiffs) {
    await Promise.all([
      archiveRemovedPages(viewerId, childLinkDiffs.removed),
      // FIXME: THIS BREAKS IF A USER DRAGS QUICKLY DUE TO DEBOUNCE
      updatePageSortOrderOnMove(childLinkDiffs.moved, newAutoLinkCodes)
    ])
  }
}
