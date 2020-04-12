/*
  Used by Relay to generate the documentId (persisted query ID)
  We prefix each with a m/q/s to tell the query type (mutation/query/subscription)
*/
const crypto = require('crypto')
const base64url = require('base64url')

const persistFunction = (text) => {
  const hasher = crypto.createHash('md5')
  hasher.update(text)
  const unsafeId = hasher.digest('base64')
  const safeId = base64url.fromBase64(unsafeId)
  const prefix = text[0]
  const id = `${prefix}_${safeId}`
  return Promise.resolve(id)
}

module.exports = persistFunction
