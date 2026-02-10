import appOrigin from './appOrigin'

const {CDN_BASE_URL, SOCKET_PORT, PROXY_CDN} = process.env

if (CDN_BASE_URL) {
  if (PROXY_CDN === 'true') {
    // for PPMIs where a public bucket is not allowed, we special case build files
    // sending the user to /build and 307 them to the CDN with a presigned URL
    __webpack_public_path__ = '/build/'
  } else {
    // pushToCDN#pushServerAssetsToCDN ensures all assets will be available on the CDN
    __webpack_public_path__ = `${CDN_BASE_URL.replace(/^\/{2,}/, 'https://')}/build/`
  }
} else {
  const url = new URL('/static/', appOrigin)
  // the webpack dev server uses /static on PORT, so fetch assets at SOCKET_PORT
  url.port = __PRODUCTION__ ? url.port : SOCKET_PORT!
  __webpack_public_path__ = url.toString()
}
