import crypto from 'crypto'

const isRSAPrivateKey = (key: string) => {
  try {
    return crypto.createPrivateKey(key).asymmetricKeyType === 'rsa'
  } catch {
    return false
  }
}

export default isRSAPrivateKey
