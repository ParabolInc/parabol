import {JWT_LIFESPAN} from 'server/utils/serverConstants';
import {toEpochSeconds} from 'server/utils/epochTime';

export default function mockAuthToken(user, overrides = {}) {
  return {
    iss: 'action-test',
    sub: user.id,
    aud: 'test-audience',
    exp: toEpochSeconds(user.lastSeenAt.getTime() + JWT_LIFESPAN),
    iat: toEpochSeconds(user.lastSeenAt),
    tms: user.tms,
    ...overrides
  };
}
