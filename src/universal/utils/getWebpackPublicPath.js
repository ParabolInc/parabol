
/* eslint-disable no-underscore-dangle */
const DEFAULT_PUBLIC_PATH = '/static/';

export default function getWebpackPublicPath() {
  let publicPath = DEFAULT_PUBLIC_PATH;

  if (!__PRODUCTION__) { return publicPath; }

  if (typeof window !== 'undefined' && window.__ACTION__.cdn) {
    // client-side:
    publicPath = window.__ACTION__.cdn;
  } else if (typeof process !== 'undefined' && process.env.CDN_URL) {
    publicPath = process.env.CDN_URL;
  }

  return `${publicPath}${publicPath.endsWith('/') ? '' : '/'}`;
}
/* eslint-enable */
