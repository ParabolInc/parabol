export const getBlacklistJWTKey = (userId: string) => `jwt:${userId}`
export const getBlacklistJWTSessionKey = (jti: string) => `jwt:jti:${jti}`
