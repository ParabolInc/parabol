import {sign} from 'jsonwebtoken';
import ms from 'ms';
import {clientSecret} from 'server/utils/auth0Helpers';
/**
 * When a user joins a team, we need to put them on that team.
 * This includes storing the team in their JWT
 */
export default function tmsSignToken(authToken, tms) {
// new token will expire in 30 days
// JWT timestamps chop off milliseconds
  const now = Date.now();
  const exp = ~~((now + ms('30d')) / 1000);
  const iat = ~~(now / 1000);
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
