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
  const signedToken = sign(jwt, INTRANET_JWT_SECRET, {expiresIn: ms('1h')});
  return signedToken;
}
