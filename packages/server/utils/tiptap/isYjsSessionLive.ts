import getKysely from '../../postgres/getKysely'
import {getBlacklistJWTKey, getBlacklistJWTSessionKey} from '../getBlacklistJWTKey'
import getRedis from '../getRedis'

export type YjsSession = {
  userId: string
  iat: number
  exp: number
  jti?: string
  connectedAt?: number
}

// A socket's token is verified once, so re-check it whenever the socket opens a document or access changes.
// refreshSession blacklists the old jti while open sockets still carry it, so a refreshed token stays valid on
// sockets opened before the refresh, but a signed out one, or a refreshed one on a newer socket, does not
export const isYjsSessionLive = async ({userId, iat, exp, jti, connectedAt}: YjsSession) => {
  if (exp * 1000 < Date.now()) return false
  const [[invalidBefore, sessionBlacklist], user] = await Promise.all([
    getRedis().mget(getBlacklistJWTKey(userId), getBlacklistJWTSessionKey(jti ?? '')),
    getKysely()
      .selectFrom('User')
      .select('id')
      .where('id', '=', userId)
      .where('isRemoved', '=', false)
      .executeTakeFirst()
  ])
  if (!user || iat < Number(invalidBefore)) return false
  if (!jti || !sessionBlacklist) return true
  const refreshedAt = Number(sessionBlacklist.split(':')[1])
  return sessionBlacklist.startsWith('refreshed:') && !!connectedAt && connectedAt <= refreshedAt
}
