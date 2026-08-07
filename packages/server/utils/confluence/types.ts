export const MAX_CONFLUENCE_EXPORT_PAGES = 100

export type DegradedItem = {
  pageId: number
  blockType: string
  count: number
  treatment: string
}

export type ExportAsset = {
  srcUrl: string
  filename: string
}

export type StorageConversionCtx = {
  parabolPageUrl: string
  appOrigin: string
  resolvePageLink?: (pageCode: number) => {href: string; confluenceTitle?: string} | null
}

export type StorageConversionResult = {
  title: string
  xhtml: string
  assets: ExportAsset[]
  degraded: Omit<DegradedItem, 'pageId'>[]
}

export type PageExportPageState = {
  pageId: number
  title: string
  depth: number
  parentPageId: number | null
  status: 'pending' | 'exporting' | 'success' | 'error' | 'skipped'
  confluencePageId?: string
  targetUrl?: string
  error?: string
  errorClass?: 'tooLarge' | 'forbidden' | 'rateLimit' | 'titleConflict' | 'network' | 'unknown'
}
