import mime from 'mime-types';
import {APP_MAX_AVATAR_FILE_SIZE} from '../../universal/utils/constants';

// todo put this in a legitify schema
export function validateAvatarUpload(contentType, contentLength) {
  if (typeof process.env.CDN_BASE_URL === 'undefined') {
    throw new Error('CDN_BASE_URL environment variable is not defined');
  }
  if (!contentType || !contentType.startsWith('image/')) {
    throw new Error('file must be an image');
  }
  const ext = mime.extension(contentType);
  if (!ext) {
    throw new Error(`unable to determine extension for ${contentType}`);
  }
  if (contentLength > APP_MAX_AVATAR_FILE_SIZE) {
    throw new Error('avatar image is too large');
  }
  return ext;
}
