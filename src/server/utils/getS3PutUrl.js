import protocolRelativeUrl from './protocolRelativeUrl';
import {s3SignPutObject} from './s3';
import path from 'path';
import {APP_CDN_USER_ASSET_SUBDIR} from '../../universal/utils/constants';

export default function getS3PutUrl(contentType, contentLength, partialPath) {
  const parsedUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL);
  const pathname = path.join(parsedUrl.pathname,
    APP_CDN_USER_ASSET_SUBDIR,
    partialPath
  );
  return s3SignPutObject(
    pathname,
    contentType,
    contentLength,
    'public-read'
  );
}
