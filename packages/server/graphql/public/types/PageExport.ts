import {CipherId} from '../../../utils/CipherId'
import type {PageExportResolvers, PageExportStatusEnum} from '../resolverTypes'

const PageExport: PageExportResolvers = {
  id: ({id}) => CipherId.toClient(Number(id), 'pageExport'),

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

  errorSummary: ({pagesJson, degradedJson}) => {
    const plural = (n: number) => (n === 1 ? '' : 's')
    const parts: string[] = []
    const failed = pagesJson.filter(({status}) => status === 'error').length
    const skipped = pagesJson.filter(({status}) => status === 'skipped').length
    if (failed) parts.push(`${failed} page${plural(failed)} failed to export`)
    if (skipped) parts.push(`${skipped} page${plural(skipped)} skipped because a parent failed`)
    const byType = new Map<string, {count: number; treatment: string}>()
    degradedJson.forEach(({blockType, count, treatment}) => {
      const entry = byType.get(blockType)
      if (entry) {
        entry.count += count
      } else {
        byType.set(blockType, {count, treatment})
      }
    })
    ;[...byType.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([blockType, {count, treatment}]) => {
        parts.push(`${count} ${blockType} block${plural(count)}: ${treatment}`)
      })
    return parts.length ? `${parts.join('. ')}.` : null
  }
}

export default PageExport
