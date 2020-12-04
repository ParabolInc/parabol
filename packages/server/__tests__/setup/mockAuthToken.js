import {toEpochSeconds} from '../../utils/epochTime'
import {Threshold} from '../../../client/types/constEnums'

export default function mockAuthToken(user, overrides = {}) {
  return {
    iss: 'action-test',
    sub: user.id,
    aud: 'test-audience',
    exp: toEpochSeconds(user.lastSeenAt.getTime() + Threshold.JWT_LIFESPAN),
    iat: toEpochSeconds(user.lastSeenAt),
    tms: user.tms,
    ...overrides
  }
}
