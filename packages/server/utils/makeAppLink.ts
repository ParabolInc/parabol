/*
 * This function can be imported from universal as a fallback
 * for making links during SSR. Be careful what you import
 * here.
 */

interface Options {
  isWebhook?: boolean
  params?: {
    utm_source: string
    utm_medium: string
    utm_campaign: string
  }
}

export default function makeAppLink(location = '', options: Options = {}) {
  const {params, isWebhook} = options
  const proto = process.env.PROTO
  const host = process.env.HOST
  const port = process.env.PORT
  const portSuffix = host !== 'localhost' ? '' : `:${port}`
  const useHook = host === 'localhost' && isWebhook
  const hostname = useHook ? 'http://dev.parabol.ultrahook.com' : `${proto}://${host}${portSuffix}`
  const url = `${hostname}/${location}`
  if (!params) return url
  const urlObj = new URL(url)
  Object.entries(params).forEach((entry) => {
    urlObj.searchParams.append(...entry)
  })
  return urlObj.toString()
}
