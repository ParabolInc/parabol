import path from 'path';
import protocolRelativeUrl from './protocolRelativeUrl';
import {
  APP_VERSION,
  APP_WEBPACK_PUBLIC_PATH_DEFAULT
} from '../../universal/utils/constants';

export default function getWebpackPublicPath() {
  if (typeof process !== 'undefined' && process.env.CDN_BASE_URL) {
    // this only runs server-side:
    const parsedUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL);
    parsedUrl.pathname = path.join(
      parsedUrl.pathname, `/build/v${APP_VERSION}/`
    );
    return protocolRelativeUrl.format(parsedUrl);
  }

  return APP_WEBPACK_PUBLIC_PATH_DEFAULT;
}
