import {getBlacklistJWTKey, getBlacklistJWTSessionKey} from './getBlacklistJWTKey'
import getRedis from './getRedis'

const checkBlacklistJWT = async ({sub, iat, jti}: {sub: string; iat: number; jti?: string}) => {
  const redis = getRedis()
  const [invalidBefore, jtiBlacklisted] = await redis.mget(
    getBlacklistJWTKey(sub),
    getBlacklistJWTSessionKey(jti ?? '') // 'jwt:jti:' is never written, so resolves null when jti absent
  )
  return iat < Number(invalidBefore) || (!!jti && jtiBlacklisted !== null)
}

export default checkBlacklistJWT
