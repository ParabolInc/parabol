import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {toEpochSeconds} from './epochTime'
import getBlacklistJWTKey from './getBlacklistJWTKey'
import getRedis from './getRedis'
import publish from './publish'

const blacklistJWT = async (userId: string, iat: number, mutatorId?: string) => {
  const key = getBlacklistJWTKey(userId)
  const redis = getRedis()
  const expiresIn = iat - toEpochSeconds(new Date()) + Math.floor(Threshold.JWT_LIFESPAN / 1000)
  await redis.set(key, iat, 'EX', expiresIn)
  publish(SubscriptionChannel.NOTIFICATION, userId, 'InvalidateSessionsPayload', {}, {mutatorId})
}

export default blacklistJWT
