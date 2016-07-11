import * as querystring from 'querystring';
import {getDotenv} from '../../universal/utils/dotenv';

getDotenv();

export default function makeAppLink(location = null, qsMap = null) {
  const proto = process.env.PROTO || 'http';
  const host = process.env.HOST || 'localhost';
  let port = process.env.PORT || '3000';
  if (process.env.NODE_ENV === 'production') {
    /* let proto field/default port win */
    port = null;
  }
  let url = `${proto}://${host}`;
  if (port) {
    url = `${url}:${port}`;
  }
  if (location) {
    url = `${url}/${location}`;
  }
  if (qsMap) {
    const qs = querystring.stringify(qsMap);
    url = `${url}?${qs}`;
  }
  return url;
}
