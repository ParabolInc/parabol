import {CipherId} from '../../../utils/CipherId'
import type {PageExportResolvers, PageExportStatusEnum} from '../resolverTypes'

const PageExport: PageExportResolvers = {
  id: ({id}) => `pageExport:${id}`,

  status: ({status}) => status as PageExportStatusEnum,

  pages: ({pagesJson}) =>
    pagesJson.map(({pageId, title, depth, status, targetUrl, error}) => ({
      pageId: CipherId.toClient(pageId, 'page'),
      title,
      depth,
      status,
      targetUrl: targetUrl ?? null,
      error: error ?? null
    })),

  degradedItems: ({degradedJson}) => {
    const byType = new Map<string, {blockType: string; count: number; treatment: string}>()
    degradedJson.forEach(({blockType, count, treatment}) => {
      const entry = byType.get(blockType)
      if (entry) {
        entry.count += count
      } else {
        byType.set(blockType, {blockType, count, treatment})
      }
    })
    return [...byType.values()].sort((a, b) => a.blockType.localeCompare(b.blockType))
  }
}

export default PageExport
