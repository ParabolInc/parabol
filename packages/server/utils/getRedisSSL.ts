import {readFileSync} from 'fs'
import path from 'path'

export const getRedisSSL = () => {
  try {
    // optional env var, likely outside the app dir
    const REDIS_SSL_DIR = process.env.REDIS_SSL_DIR!
    const ca = readFileSync(path.join(REDIS_SSL_DIR, 'ca.crt'), 'ascii')
    const key = readFileSync(path.join(REDIS_SSL_DIR, 'tls.key'), 'ascii')
    const cert = readFileSync(path.join(REDIS_SSL_DIR, 'tls.crt'), 'ascii')
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
