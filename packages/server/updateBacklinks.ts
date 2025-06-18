import type {Document} from '@hocuspocus/server'
import type {JSONContent} from '@tiptap/core'
import {getPageLinksFromPage} from '../client/shared/tiptap/getPageLinksFromPage'
import getKysely from './postgres/getKysely'
import {CipherId} from './utils/CipherId'
import {getPageLinkDiffs} from './utils/tiptap/getPageLinkDiffs'

export const updateBacklinks = async (pageId: number, document: Document, content: JSONContent) => {
  const metadata = document.getMap('metadata')
  const oldPageLinkIds = (metadata.get('pageLinkIds') as number[] | undefined) ?? []
  const newPageLinkIdSet = getPageLinksFromPage(content)
  const pageLinkDiffs = getPageLinkDiffs(oldPageLinkIds, newPageLinkIdSet)
  if (!pageLinkDiffs) return
  const {additions, deletions, newIds} = pageLinkDiffs
  metadata.set('pageLinkIds', newIds) // plain JSON array, no CRDT, all-or-nothing updates
  const pg = getKysely()
  await Promise.all([
    additions.length &&
      pg
        .insertInto('PageBacklink')
        .values(
          pageLinkDiffs.additions.map((id) => ({
            toPageId: CipherId.decrypt(id),
            fromPageId: pageId
          }))
        )
        .execute(),
    deletions.length &&
      pg
        .deleteFrom('PageBacklink')
        .where('fromPageId', '=', pageId)
        .where('toPageId', 'in', deletions.map(CipherId.decrypt))
        .execute()
  ])
}
