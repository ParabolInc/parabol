import path from 'path'
import protocolRelativeUrl from './protocolRelativeUrl'
import {APP_WEBPACK_PUBLIC_PATH_DEFAULT} from '../../client/utils/constants'
import getDotenv from '../../server/utils/dotenv'

// Import .env and expand variables:
getDotenv()

const APP_VERSION = process.env.npm_package_version

export default function getWebpackPublicPath () {
  if (
    typeof process !== 'undefined' &&
    process.env.CDN_BASE_URL &&
    !process.env.DISABLE_CDN_BUILD
  ) {
    // this only runs server-side:
    const parsedUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL)
    parsedUrl.pathname = path.join(parsedUrl.pathname, `/build/v${APP_VERSION}/`)
    return protocolRelativeUrl.format(parsedUrl)
  }

  return APP_WEBPACK_PUBLIC_PATH_DEFAULT
}
