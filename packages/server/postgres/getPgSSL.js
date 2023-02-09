const {readFileSync} = require('fs')
const path = require('path')

const getSSL = () => {
  try {
    // optional env var, likely outside the app dir
    const POSTGRES_SSL_DIR = process.env.POSTGRES_SSL_DIR
    if (!POSTGRES_SSL_DIR) return undefined

    const ca = readFileSync(path.join(POSTGRES_SSL_DIR, 'root.crt'))
    const key = readFileSync(path.join(POSTGRES_SSL_DIR, 'postgresql.key'))
    const cert = readFileSync(path.join(POSTGRES_SSL_DIR, 'postgresql.crt'))
    return {
      ca,
      key,
      cert,
      rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true
    }
  } catch (e) {
    return undefined
  }
}

module.exports = getSSL
