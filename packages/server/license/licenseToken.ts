import {createPrivateKey, createPublicKey, sign, verify} from 'node:crypto'

/*
A Parabol license is a small JSON document signed with Ed25519, written as two base64url parts:
`<payload>.<signature>`, where the signature covers the payload's base64url text. Parabol signs it with a private key
it keeps to itself; the server checks it against the public keys in licensePublicKeys.ts, picked by `kid`.
*/

export type LicensedTier = 'team' | 'enterprise'

export interface LicenseClaims {
  /** The format's version */
  v: 1
  /** Which of Parabol's signing keys signed it */
  kid: string
  /** The license's own ID, for support */
  id: string
  /** Who it was issued to */
  customer: string
  /** The highest tier the instance's organizations may use without a Stripe subscription */
  tier: LicensedTier
  /** How many active users it covers. Absent: any number */
  seats?: number
  /** The hostnames (Parabol's HOST) it's valid on, `*.example.com` matching any subdomain. Absent: any host */
  hosts?: string[]
  /** ISO 8601 */
  issuedAt: string
  /** ISO 8601. Absent: it never expires */
  expiresAt?: string
}

export type LicenseParseResult =
  | {ok: true; claims: LicenseClaims}
  | {ok: false; reason: 'missing' | 'invalid'; error?: string}

const base64url = (buf: Buffer) => buf.toString('base64url')

export const signLicense = (claims: LicenseClaims, privateKeyPem: string) => {
  const payload = base64url(Buffer.from(JSON.stringify(claims)))
  const signature = sign(null, Buffer.from(payload), createPrivateKey(privateKeyPem))
  return `${payload}.${base64url(signature)}`
}

const isIsoDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value))

const checkClaims = (claims: any): string | undefined => {
  if (!claims || typeof claims !== 'object') return 'the payload is not an object'
  if (claims.v !== 1) return `unsupported version ${claims.v}`
  if (typeof claims.kid !== 'string' || !claims.kid) return 'kid is missing'
  if (typeof claims.id !== 'string' || !claims.id) return 'id is missing'
  if (typeof claims.customer !== 'string' || !claims.customer) return 'customer is missing'
  if (claims.tier !== 'team' && claims.tier !== 'enterprise') return `unknown tier ${claims.tier}`
  if (claims.seats !== undefined && !(Number.isInteger(claims.seats) && claims.seats > 0)) {
    return 'seats must be a positive integer'
  }
  if (
    claims.hosts !== undefined &&
    !(
      Array.isArray(claims.hosts) &&
      claims.hosts.length > 0 &&
      claims.hosts.every((h: unknown) => typeof h === 'string' && h)
    )
  ) {
    return 'hosts must be a non-empty list of hostnames'
  }
  if (!isIsoDate(claims.issuedAt)) return 'issuedAt is not a date'
  if (claims.expiresAt !== undefined && !isIsoDate(claims.expiresAt))
    return 'expiresAt is not a date'
  return undefined
}

const hostOnly = (host: string) => host.trim().toLowerCase().replace(/:\d+$/, '')

export const isHostCovered = (hosts: string[] | undefined, host: string | undefined) => {
  if (!hosts) return true
  if (!host) return false
  const target = hostOnly(host)
  return hosts.some((pattern) => {
    const p = hostOnly(pattern)
    return p.startsWith('*.') ? target.endsWith(p.slice(1)) : target === p
  })
}

/** Checks a license's signature, its claims, and that it covers this host. It doesn't look at expiry. */
export const parseLicense = (
  token: string | undefined,
  publicKeys: Record<string, string>,
  host: string | undefined
): LicenseParseResult => {
  const trimmed = token?.trim()
  if (!trimmed) return {ok: false, reason: 'missing'}
  const parts = trimmed.split('.')
  if (parts.length !== 2)
    return {ok: false, reason: 'invalid', error: 'it is not a Parabol license'}
  const [payload, signature] = parts as [string, string]
  let claims: any
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return {ok: false, reason: 'invalid', error: 'the payload is not JSON'}
  }
  const keyPem = typeof claims?.kid === 'string' ? publicKeys[claims.kid] : undefined
  if (!keyPem) return {ok: false, reason: 'invalid', error: `unknown signing key ${claims?.kid}`}
  let signatureOk = false
  try {
    signatureOk = verify(
      null,
      Buffer.from(payload),
      createPublicKey(keyPem),
      Buffer.from(signature, 'base64url')
    )
  } catch {
    signatureOk = false
  }
  if (!signatureOk) return {ok: false, reason: 'invalid', error: 'the signature does not match'}
  const claimsError = checkClaims(claims)
  if (claimsError) return {ok: false, reason: 'invalid', error: claimsError}
  if (!isHostCovered(claims.hosts, host)) {
    return {
      ok: false,
      reason: 'invalid',
      error: `it covers ${claims.hosts.join(', ')}, not ${host ?? 'this host'}`
    }
  }
  return {ok: true, claims}
}
