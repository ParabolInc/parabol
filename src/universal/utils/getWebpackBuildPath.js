import url from 'url';
import {APP_VERSION} from './constants';

/* eslint-disable no-underscore-dangle */
const DEFAULT_PUBLIC_PATH = '/static/';

export default function getWebpackBuildPath() {
  let publicPath = DEFAULT_PUBLIC_PATH;

  if (typeof window !== 'undefined' && window.__ACTION__ && window.__ACTION__.cdn) {
    // client-side:
    publicPath = window.__ACTION__.cdn;
  } else if (typeof process !== 'undefined' && process.env.CDN_BASE_URL) {
    // server-side:
    publicPath = process.env.CDN_BASE_URL.endsWith('/') ?
      process.env.CDN_BASE_URL.slice(0, -1) : process.env.CDN_BASE_URL;
    publicPath = `${publicPath}/build/v${APP_VERSION}`;
  }

  return `${publicPath}${publicPath.endsWith('/') ? '' : '/'}`;
}
/* eslint-enable */

export function getS3BuildBasePath() {
  let publicPath = getWebpackBuildPath();
  if (publicPath.startsWith('//')) {
    // protocol-relative url? normalize it:
    publicPath = `http:${publicPath}`;
  }
  // parse URL:
  const parsedUrl = url.parse(publicPath);
  if (!parsedUrl.protocol) {
    throw new Error(`invalid webpack public path ${publicPath}`);
  }

  return parsedUrl.path.substring(1); // removes leading '/'
}
