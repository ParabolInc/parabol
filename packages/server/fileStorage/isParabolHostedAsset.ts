import appOrigin from '../appOrigin'

export const isParabolHostedAsset = (src: string | URL) => {
  try {
    const url = new URL(src, appOrigin)
    return url.origin === appOrigin && url.pathname.startsWith('/assets/')
  } catch {
    return false
  }
}
