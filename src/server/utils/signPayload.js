import crypto from 'crypto'

const signPayload = (secret, payload, algorithm = 'SHA256') => {
  return crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest('hex')
}

export default signPayload
