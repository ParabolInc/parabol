const path = require('path')
const protocolRelativeUrl = require('../../../packages/server/utils/protocolRelativeUrl')

const APP_VERSION = process.env.npm_package_version
const APP_WEBPACK_PUBLIC_PATH_DEFAULT = '/static/'

module.exports = function getWebpackPublicPath() {
  if (!process.env.CDN_BASE_URL) return APP_WEBPACK_PUBLIC_PATH_DEFAULT
  const parsedUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL)
  parsedUrl.pathname = path.join(parsedUrl.pathname, `/build/v${APP_VERSION}/`)
  return protocolRelativeUrl.format(parsedUrl)
}
