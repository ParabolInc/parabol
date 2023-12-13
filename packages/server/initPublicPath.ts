import appOrigin from './appOrigin'

declare let __webpack_public_path__: string
declare const __PRODUCTION__: boolean

const {CDN_BASE_URL, SOCKET_PORT} = process.env

if (CDN_BASE_URL) {
  // pushToCDN#pushServerAssetsToCDN ensures all assets will be available on the CDN
  __webpack_public_path__ = `${CDN_BASE_URL.replace(/^\/{2,}/, 'https://')}/build/`
} else {
  const url = new URL('/static/', appOrigin)
  // the webpack dev server uses /static on PORT, so fetch assets at SOCKET_PORT
  url.port = __PRODUCTION__ ? url.port : SOCKET_PORT!
  __webpack_public_path__ = url.toString()
}
