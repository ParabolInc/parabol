import {sign} from 'jsonwebtoken';
import {clientSecret} from 'server/utils/auth0Helpers';
import {JWT_LIFESPAN} from 'server/utils/serverConstants';

export const mintTokenUnsigned = (userId, fields) => {
  const now = Date.now();
  const exp = ~~((now + JWT_LIFESPAN) / 1000); // eslint-disable-line no-bitwise
  const iat = ~~(now / 1000); // eslint-disable-line no-bitwise

  const newToken = {
    iss: 'ava-unit-test',
    sub: userId,
    aud: process.env.AUTH0_CLIENT_ID,
    exp,
    iat,
    ...fields
  };

  return newToken;
};

export const mintTokenSigned = (userId, fields) => {
  return sign(mintTokenUnsigned(userId, fields), clientSecret);
};

export default mintTokenUnsigned;
