import {sign} from 'jsonwebtoken';
import {clientSecret} from '../../utils/auth0Helpers';
import {JWT_LIFESPAN} from '../../utils/serverConstants';
import {auth0} from '../../../universal/utils/clientOptions';

export default (userId) => {
  const now = Date.now();
  const exp = ~~((now + JWT_LIFESPAN) / 1000);
  const iat = ~~(now / 1000);

  const newToken = {
    iss: 'ava-unit-test',
    sub: userId,
    aud: auth0.clientId,
    exp,
    iat
  };

  const secret = new Buffer(clientSecret, 'base64');

  return sign(newToken, secret);
};
