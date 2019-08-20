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

export default function makeAppLink (location: string = '', options: Options = {}) {
  const {qs, isWebhook} = options
  const proto = process.env.PROTO || 'http'
  const host = process.env.HOST || 'localhost'
  const port = process.env.PORT || '3000'
  const portSuffix = process.env.NODE_ENV === 'production' ? '' : `:${port}`
  const qsSuffix = qs ? `?${querystring.stringify(qs)}` : ''
  if (host === 'localhost' && isWebhook) {
    return `http://dev.parabol.ultrahook.com/${location}${qsSuffix}`
  }
  return `${proto}://${host}${portSuffix}/${location}${qsSuffix}`
}
