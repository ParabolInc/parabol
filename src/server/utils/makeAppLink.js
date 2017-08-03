/*
 * This function can be imported from universal as a fallback
 * for making links during SSR. Be careful what you import
 * here.
 */
import * as querystring from 'querystring';

export default function makeAppLink(_location, {qs, isWebhook}) {
  // ugly workaround for uglify v2.7.4 https://github.com/mishoo/UglifyJS2/issues/1349
  const location = _location || '';
  const proto = process.env.PROTO || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || '3000';
  const portSuffix = process.env.NODE_ENV === 'production' ? '' : `:${port}`;
  const qsSuffix = qs ? `?${querystring.stringify(qs)}` : '';
  if (host === 'localhost' && isWebhook) {
    return `http://dev.parabol.ultrahook.com/${location}${qsSuffix}`;
  }
  return `${proto}://${host}${portSuffix}/${location}${qsSuffix}`;
}
