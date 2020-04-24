/*
 * This function can be imported from universal as a fallback
 * for making links during SSR. Be careful what you import
 * here.
 */
import * as querystring from 'querystring'

interface Options {
  qs?: {[key: string]: string}
  isWebhook?: boolean
}

export default function makeAppLink(location = '', options: Options = {}) {
  const {qs, isWebhook} = options
  const proto = process.env.PROTO
  const host = process.env.HOST
  const port = process.env.PORT
  const portSuffix = host !== 'localhost' ? '' : `:${port}`
  const qsSuffix = qs ? `?${querystring.stringify(qs)}` : ''
  if (host === 'localhost' && isWebhook) {
    return `http://dev.parabol.ultrahook.com/${location}${qsSuffix}`
  }
  return `${proto}://${host}${portSuffix}/${location}${qsSuffix}`
}
