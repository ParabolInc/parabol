import crypto from 'node:crypto'

// a token is 32 random bytes, so a fast hash is as safe as bcrypt and costs microseconds per request instead of ~300ms of CPU
const hashRandomToken = (rawToken: string) =>
  crypto.createHash('sha256').update(rawToken).digest('base64url')

export default hashRandomToken
