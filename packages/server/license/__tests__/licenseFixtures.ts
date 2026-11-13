import {createPrivateKey, generateKeyPairSync, sign} from 'node:crypto'
import type {LicenseClaims} from '../licenseToken'

// Parabol issues licenses with its tools in parabol-infra. Tests sign their own with these

export const makeSigningKeys = (algorithm: 'ed25519' | 'ml-dsa-87' = 'ed25519') => {
  const {privateKey, publicKey} = generateKeyPairSync(algorithm as 'ed25519')
  return {
    privatePem: privateKey.export({type: 'pkcs8', format: 'pem'}).toString(),
    publicPem: publicKey.export({type: 'spki', format: 'pem'}).toString()
  }
}

export const signLicense = (
  claims: LicenseClaims | Record<string, unknown>,
  privatePem: string
) => {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url')
  const signature = sign(null, Buffer.from(payload), createPrivateKey(privatePem))
  return `${payload}.${signature.toString('base64url')}`
}

export const makeUsageKeys = () => {
  const jwk = generateKeyPairSync('ed25519').privateKey.export({format: 'jwk'})
  return {privateUsageKey: jwk.d!, publicUsageKey: jwk.x!}
}
