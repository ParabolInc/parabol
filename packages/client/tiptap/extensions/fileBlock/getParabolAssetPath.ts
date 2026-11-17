// Parabol serves assets from its own host, on whichever protocol PROTO says. Older docs point at the CDN's file store
export const getParabolAssetPath = (src: string) => {
  const {origin, host} = window.location
  let url: URL
  try {
    url = new URL(src, origin)
  } catch {
    return null
  }
  const {pathname, protocol} = url
  const isOwnHost = url.host === host && (protocol === 'https:' || protocol === 'http:')
  if (isOwnHost && (pathname.startsWith('/assets/') || pathname.startsWith('/self-hosted/'))) {
    return pathname
  }
  const publicPath = window.__ACTION__?.publicPath
  if (!publicPath) return null
  const storeUrl = new URL('../store/', new URL(publicPath, origin))
  return url.href.startsWith(storeUrl.href) ? pathname : null
}
