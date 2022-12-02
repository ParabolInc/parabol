const {readFileSync} = require('fs')
const path = require('path')

const getSSL = () => {
  try {
    // optional env var, likely outside the app dir
    const PG_CERT_DIR = process.env.PG_CERT_DIR
    const ca = readFileSync(path.join(PG_CERT_DIR, 'root.crt'))
    const key = readFileSync(path.join(PG_CERT_DIR, 'postgresql.key'))
    const cert = readFileSync(path.join(PG_CERT_DIR, 'postgresql.crt'))
    return {ca, key, cert, rejectUnauthorized: false}
  } catch (e) {
    return undefined
  }
}

module.exports = getSSL
