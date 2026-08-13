import {getPageLinks} from 'parabol-client/shared/tiptap/getPageLinks'
import {applyUpdate, Doc} from 'yjs'
import {pageAccessByUserIdBatchFn} from '../../../../../dataloader/pageAccessByUserIdBatchFn'
import getKysely from '../../../../../postgres/getKysely'
import {CipherId} from '../../../../../utils/CipherId'
import {
  MAX_CONFLUENCE_EXPORT_PAGES,
  type PageExportPageState
} from '../../../../../utils/confluence/types'

/**
 * Builds the export tree in canonical order: children are discovered from the position of
 * canonical pageLinkBlock nodes inside each parent's yDoc (Page.sortOrder does NOT order
 * child pages). Skips trashed, viewer-inaccessible, and permission-unlinked pages —
 * isParentLinked=false marks a sub-page whose access was deliberately restricted below
 * its parent's, so exporting it alongside the parent would leak it to the parent's
 * audience. Collects at most MAX_CONFLUENCE_EXPORT_PAGES + 1 entries so callers can
 * detect overflow.
 */
export const loadPageExportTree = async (
  rootPageId: number,
  includeSubPages: boolean,
  viewerId: string
): Promise<PageExportPageState[]> => {
  const pg = getKysely()
  const result: PageExportPageState[] = []
  const seen = new Set<number>([rootPageId])

  const walk = async (pageId: number, parentPageId: number | null, depth: number) => {
    if (result.length > MAX_CONFLUENCE_EXPORT_PAGES) return
    const page = await pg
      .selectFrom('Page')
      .select(['id', 'title', 'yDoc', 'deletedAt', 'isParentLinked', 'isDatabase'])
      .where('id', '=', pageId)
      .executeTakeFirst()
    if (!page || page.deletedAt) return
    if (depth > 0 && !page.isParentLinked) return
    const [role] = await pageAccessByUserIdBatchFn([{pageId, userId: viewerId}])
    if (!role) return
    result.push({
      pageId,
      title: page.title || 'Untitled',
      depth,
      parentPageId,
      status: 'pending'
    })
    if (!includeSubPages) return
    // database pages export as a static table snapshot; their rows are not child pages
    const childCodes =
      page.isDatabase || !page.yDoc
        ? []
        : getPageLinks(hydrateDoc(page.yDoc), true).map((link) =>
            Number(link.getAttribute('pageCode'))
          )
    for (const pageCode of childCodes) {
      if (!Number.isFinite(pageCode)) continue
      const childId = CipherId.decrypt(pageCode)
      if (seen.has(childId)) continue
      seen.add(childId)
      await walk(childId, pageId, depth + 1)
    }
  }

  await walk(rootPageId, null, 0)
  return result
}

const hydrateDoc = (yDoc: Buffer) => {
  const doc = new Doc()
  applyUpdate(doc, yDoc)
  return doc
}
