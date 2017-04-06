import {sign} from 'jsonwebtoken';
import getDotenv from '../../universal/utils/dotenv';
import ms from 'ms';

getDotenv();
export default function getIntranetToken() {
  const jwt = {
    iss: 'action-test',
    sub: 'admin@parabol.co',
    rol: 'su'
  };
  const INTRANET_JWT_SECRET = process.env.INTRANET_JWT_SECRET || '';
  const b64Secret = new Buffer(INTRANET_JWT_SECRET, 'base64');
  const signedToken = sign(jwt, b64Secret, {expiresIn: ms('1h')});
  console.log('New JWT: ', signedToken);
  return signedToken;
}
