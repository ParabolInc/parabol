import {
  APP_VERSION,
  APP_WEBPACK_PUBLIC_PATH_DEFAULT
} from '../../universal/utils/constants';

export default function getWebpackPublicPath() {
  if (typeof process !== 'undefined' && process.env.CDN_BASE_URL) {
    // server-side:
    const publicPath = process.env.CDN_BASE_URL.endsWith('/') ?
      process.env.CDN_BASE_URL.slice(0, -1) : process.env.CDN_BASE_URL;
    return `${publicPath}/build/v${APP_VERSION}/`;
  }

  return APP_WEBPACK_PUBLIC_PATH_DEFAULT;
}
