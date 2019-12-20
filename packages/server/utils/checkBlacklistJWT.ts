import getBlacklistJWTKey from './getBlacklistJWTKey'
import getRedis from './getRedis'

const checkBlacklistJWT = async (userId: string, iat: number) => {
  const key = getBlacklistJWTKey(userId)
  const redis = getRedis()
  const invalidBefore = await redis.get(key)
  return iat < Number(invalidBefore)
}

export default checkBlacklistJWT
