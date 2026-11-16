import appOrigin from '../../appOrigin'

export const PAGE_ASSET_ATTRS = new Map<string, readonly string[]>([
  ['imageBlock', ['src']],
  ['fileBlock', ['src']],
  ['embedBlock', ['thumbnailUrl', 'faviconUrl']]
])

export const isParabolHostedAsset = (src: string) => {
  try {
    const url = new URL(src, appOrigin)
    return url.origin === appOrigin && url.pathname.startsWith('/assets/')
  } catch {
    return false
  }
}
