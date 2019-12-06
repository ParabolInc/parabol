import getBlacklistJWTKey from './getBlacklistJWTKey'
import {Threshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {toEpochSeconds} from './epochTime'
import publish from './publish'

const blacklistJWT = async (userId: string, iat: number, mutatorId?: string) => {
  const key = getBlacklistJWTKey(userId)
  const redis = getRedis()
  const exp = iat + Math.floor(Threshold.JWT_LIFESPAN / 1000)
  const expiresIn = exp - toEpochSeconds(new Date())
  await redis.set(key, iat, 'EX', expiresIn)
  publish(SubscriptionChannel.NOTIFICATION, userId, 'InvalidateSessionsPayload', {}, {mutatorId})
}

export default blacklistJWT
