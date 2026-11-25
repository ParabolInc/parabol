import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import getKysely from '../postgres/getKysely'
import {toEpochSeconds} from './epochTime'
import {getBlacklistJWTKey, getBlacklistJWTSessionKey} from './getBlacklistJWTKey'
import getRedis from './getRedis'
import publish from './publish'
import {revalidateYjsConnections} from './tiptap/revalidateYjsConnections'

// blacklist all tokens issued before iat, and disconnect every OAuth app so it can't refresh past it
export const blacklistJWT = async (userId: string, iat: number, mutatorId?: string) => {
  const key = getBlacklistJWTKey(userId)
  const redis = getRedis()
  const expiresIn = iat - toEpochSeconds(new Date()) + Math.floor(Threshold.JWT_LIFESPAN / 1000)
  await Promise.all([
    redis.set(key, iat, 'EX', expiresIn),
    getKysely().deleteFrom('OAuthAPIGrant').where('userId', '=', userId).execute()
  ])
  publish(
    SubscriptionChannel.NOTIFICATION,
    userId,
    'InvalidateSessionsPayload',
    {userId},
    {mutatorId}
  )
  await revalidateYjsConnections({userIds: [userId]})
}

// blacklist a single session by jti. A refresh that took nothing away records when it happened, so sockets opened before it keep working
export const blacklistJWTSession = async (jti: string, exp: number, refreshedAt?: number) => {
  const key = getBlacklistJWTSessionKey(jti)
  const redis = getRedis()
  const expiresIn = exp - toEpochSeconds(new Date())
  await redis.set(key, refreshedAt ? `refreshed:${refreshedAt}` : 1, 'EX', expiresIn)
}
