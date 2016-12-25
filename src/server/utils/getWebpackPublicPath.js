import path from 'path';
import protoRelUrl from './protoRelUrl';
import {
  APP_VERSION,
  APP_WEBPACK_PUBLIC_PATH_DEFAULT
} from '../../universal/utils/constants';

export default function getWebpackPublicPath() {
  if (typeof process !== 'undefined' && process.env.CDN_BASE_URL) {
    // this only runs server-side:
    const parsedUrl = protoRelUrl.parse(process.env.CDN_BASE_URL);
    parsedUrl.pathname = path.join(
      parsedUrl.pathname, `/build/v${APP_VERSION}/`
    );
    return protoRelUrl.format(parsedUrl);
  }

  return APP_WEBPACK_PUBLIC_PATH_DEFAULT;
}
