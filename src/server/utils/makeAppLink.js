import * as querystring from 'querystring';
import {getDotenv} from 'universal/utils/dotenv';

getDotenv();

export default function makeAppLink(location = '', qsMap) {
  const proto = process.env.PROTO || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || '3000';
  const portSuffix = process.env.NODE_ENV === 'production' ? '' : `:${port}`;
  const qsSuffix = qsMap ? `?${querystring.stringify(qsMap)}` : '';
  return `${proto}://${host}${portSuffix}/${location}${qsSuffix}`;
}
