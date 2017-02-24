import {sign} from 'jsonwebtoken';
import {clientSecret} from './auth0Helpers';
import {JWT_LIFESPAN} from './serverConstants';
import {toEpochSeconds} from 'server/utils/epochTime';

/**
 * When a user joins a team, we need to put them on that team.
 * This includes storing the team in their JWT
 */
export default function tmsSignToken(authToken, tms) {
// new token will expire in 30 days
// JWT timestamps chop off milliseconds
  const now = Date.now();
  const exp = toEpochSeconds(now + JWT_LIFESPAN);
  const iat = toEpochSeconds(now);
  const newToken = {
    ...authToken,
    exp,
    iat,
    tms
  };
  // auth0 signs their tokens with a base64 buffer, so we should too, otherwise the socket will get confused
  const secret = new Buffer(clientSecret, 'base64');
  return sign(newToken, secret);
}
