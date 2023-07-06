const {readFileSync} = require('fs')
const path = require('path')

const getRedisSSL = () => {
  try {
    // optional env var, likely outside the app dir
    const REDIS_SSL_DIR = process.env.REDIS_SSL_DIR
    const ca = readFileSync(path.join(REDIS_SSL_DIR, 'root.crt'), 'ascii')
    const key = readFileSync(path.join(REDIS_SSL_DIR, 'redis.key'), 'ascii')
    const cert = readFileSync(path.join(REDIS_SSL_DIR, 'redis.crt'), 'ascii')
    return {
      ca,
      key,
      cert,
      rejectUnauthorized: process.env.REDIS_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true
    }
  } catch (e) {
    return undefined
  }
}

module.exports = getRedisSSL
