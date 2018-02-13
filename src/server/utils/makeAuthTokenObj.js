/**
 * When a user joins a team, we need to put them on that team.
 * This includes storing the team in their JWT
 */
import {clientId} from './auth0Helpers';
import {JWT_LIFESPAN} from './serverConstants';
import {toEpochSeconds} from 'server/utils/epochTime';
import makeAppLink from 'server/utils/makeAppLink';

/**
 * Takes a JWT auth token payload, modifies the `tms` (teams) field with the
 * provided value, and returns a signed JWT with the updated field.
 */
const makeAuthTokenObj = (sub, tms) => {
  if (!sub || !tms) {
    throw new Error('Must provide valid auth token with `sub` or `tms`');
  }
  // new token will expire in 30 days
  // JWT timestamps chop off milliseconds
  const now = Date.now();
  const exp = toEpochSeconds(now + JWT_LIFESPAN);
  const iat = toEpochSeconds(now);
  return {
    sub,
    aud: clientId,
    iss: makeAppLink(),
    exp,
    iat,
    tms
  };
};

export default makeAuthTokenObj;
