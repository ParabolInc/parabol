import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {toEpochSeconds} from './epochTime'
import {getBlacklistJWTKey, getBlacklistJWTSessionKey} from './getBlacklistJWTKey'
import getRedis from './getRedis'
import publish from './publish'

// blacklist all tokens issued before iat
export const blacklistJWT = async (userId: string, iat: number, mutatorId?: string) => {
  const key = getBlacklistJWTKey(userId)
  const redis = getRedis()
  const expiresIn = iat - toEpochSeconds(new Date()) + Math.floor(Threshold.JWT_LIFESPAN / 1000)
  await redis.set(key, iat, 'EX', expiresIn)
  publish(SubscriptionChannel.NOTIFICATION, userId, 'InvalidateSessionsPayload', {}, {mutatorId})
}

// blacklist a single session by jti
export const blacklistJWTSession = async (jti: string, exp: number) => {
  const key = getBlacklistJWTSessionKey(jti)
  const redis = getRedis()
  const expiresIn = exp - toEpochSeconds(new Date())
  await redis.set(key, 1, 'EX', expiresIn)
}
