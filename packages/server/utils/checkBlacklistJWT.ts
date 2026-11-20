import {getBlacklistJWTKey, getBlacklistJWTSessionKey} from './getBlacklistJWTKey'
import getRedis from './getRedis'

// A refreshed token can't make new requests or open sockets, but a socket that verified it before the refresh keeps it,
// like a Yjs socket. Every token on a socket was checked when it got there, or minted with a new jti, and a refresh
// that took a team or role away blacklists the token as signed out
const checkBlacklistJWT = async (
  {sub, iat, jti}: {sub: string; iat: number; jti?: string},
  isOpenSocket = false
) => {
  const redis = getRedis()
  const [invalidBefore, jtiBlacklisted] = await redis.mget(
    getBlacklistJWTKey(sub),
    getBlacklistJWTSessionKey(jti ?? '') // 'jwt:jti:' is never written, so resolves null when jti absent
  )
  if (iat < Number(invalidBefore)) return true
  if (!jti || !jtiBlacklisted) return false
  return !(isOpenSocket && jtiBlacklisted.startsWith('refreshed:'))
}

export default checkBlacklistJWT
