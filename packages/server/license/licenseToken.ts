import {createPrivateKey, createPublicKey, sign, verify} from 'node:crypto'

/*
A license is what lets a production build of Parabol start: without a valid one, the web server exits (see
instanceLicense.ts). It says who it's for and can limit the hosts it runs on. Its expiry and seats travel with it for
usage reports and for later versions to act on; nothing acts on them yet. Fields a version doesn't know are ignored,
so later licenses can carry new terms without breaking the versions before them.

PRIVATE_LICENSE_KEY holds three base64url parts separated by dots: `<payload>.<signature>.<private usage key>`.
- The payload is the license's JSON, and the signature is Parabol's signature of the payload's base64url text,
  checked against the public keys in licensePublicKeys.ts, picked by `kid`. Together they're the license.
- The private usage key is the private half of the instance's own Ed25519 key pair, whose public half the license
  names as `publicUsageKey`. It signs usage reports, which carry the license, so Parabol checks a report with its own
  public key alone. A report never carries the private usage key.
Parabol issues licenses and checks usage reports with tools in parabol-infra.
*/

export interface LicenseClaims {
  /** The format's version */
  v: 1
  /** Which of Parabol's signing keys signed it */
  kid: string
  /** The license's own ID, for support */
  id: string
  /** Who it was issued to */
  customer: string
  /** How many active users it covers. Absent: any number */
  seats?: number
  /** The hostnames (Parabol's HOST) it's valid on, `*.example.com` matching any subdomain. Absent: any host */
  hosts?: string[]
  /** ISO 8601 */
  issuedAt: string
  /** ISO 8601. Absent: it never expires */
  expiresAt?: string
  /** The public half of the instance's usage key pair: a raw Ed25519 key in base64url. Absent: no usage reports */
  publicUsageKey?: string
  /** What usage reports carry (UsageReportLevel). Absent: no usage reports */
  usageReports?: string
  /** 'test' for a license only for testing Parabol, whose web server freezes a while after it starts. Absent: in use */
  type?: string
  /** 'read-only' to refuse every change once expiresAt passes. Absent: nothing happens at expiry */
  onExpiry?: string
}

/**
 * What usage reports carry: nothing, as there are none (''), active users ('user-count'), or also who runs the most
 * meetings, by name and email ('user-activity'). A level this version doesn't know counts as 'user-count'.
 */
export type UsageReportLevel = '' | 'user-count' | 'user-activity'

export const usageReportLevelOf = (claims: LicenseClaims): UsageReportLevel => {
  if (!claims.usageReports || !claims.publicUsageKey) return ''
  return claims.usageReports === 'user-activity' ? 'user-activity' : 'user-count'
}

export type LicenseParseResult =
  | {ok: true; claims: LicenseClaims}
  | {ok: false; reason: 'missing' | 'invalid'; error?: string}

const base64url = (buf: Buffer) => buf.toString('base64url')
const isIsoDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value))

const ED25519_PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex')
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex')

const rawKey = (key: string) => {
  const raw = Buffer.from(key, 'base64url')
  if (raw.length !== 32) throw new Error('an Ed25519 key is 32 bytes')
  return raw
}
const privateUsageKeyObject = (privateUsageKey: string) =>
  createPrivateKey({
    key: Buffer.concat([ED25519_PKCS8_PREFIX, rawKey(privateUsageKey)]),
    format: 'der',
    type: 'pkcs8'
  })
const publicUsageKeyObject = (publicUsageKey: string) =>
  createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, rawKey(publicUsageKey)]),
    format: 'der',
    type: 'spki'
  })

const publicUsageKeyOf = (privateUsageKey: string) => {
  try {
    return createPublicKey(privateUsageKeyObject(privateUsageKey)).export({format: 'jwk'}).x
  } catch {
    return undefined
  }
}

/** What's wrong with the claims this version knows, or undefined when nothing is */
export const checkClaims = (claims: any): string | undefined => {
  if (!claims || typeof claims !== 'object') return 'the payload is not an object'
  if (claims.v !== 1) return `unsupported version ${claims.v}`
  if (typeof claims.kid !== 'string' || !claims.kid) return 'kid is missing'
  if (typeof claims.id !== 'string' || !claims.id) return 'id is missing'
  if (typeof claims.customer !== 'string' || !claims.customer) return 'customer is missing'
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
  if (claims.expiresAt !== undefined && !isIsoDate(claims.expiresAt)) {
    return 'expiresAt is not a date'
  }
  for (const field of ['usageReports', 'type', 'onExpiry'] as const) {
    if (claims[field] !== undefined && typeof claims[field] !== 'string')
      return `${field} must be text`
  }
  if (claims.publicUsageKey !== undefined) {
    try {
      publicUsageKeyObject(claims.publicUsageKey)
    } catch {
      return 'publicUsageKey is not an Ed25519 public key'
    }
  }
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

/**
 * Checks a license, `<payload>.<signature>`: its signature, its claims, and that it covers this host.
 * It doesn't look at expiry.
 */
export const parseLicense = (
  license: string | undefined,
  publicKeys: Record<string, string>,
  host: string | undefined
): LicenseParseResult => {
  const trimmed = license?.trim()
  if (!trimmed) return {ok: false, reason: 'missing'}
  const parts = trimmed.split('.')
  if (parts.length !== 2) {
    return {ok: false, reason: 'invalid', error: 'it is not a Parabol license'}
  }
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

export type PrivateUsageKeyResult =
  | {ok: true; privateUsageKey: string; license: string}
  | {ok: false; error: string}

/**
 * Splits PRIVATE_LICENSE_KEY into the license, checked as parseLicense checks it, and the private usage key that
 * signs usage reports
 */
export const parsePrivateLicenseKey = (
  privateLicenseKey: string | undefined,
  publicKeys: Record<string, string>,
  host: string | undefined
): {parsed: LicenseParseResult; usage: PrivateUsageKeyResult} => {
  const parts = privateLicenseKey?.trim().split('.') ?? []
  const license = parts.length === 3 ? `${parts[0]}.${parts[1]}` : privateLicenseKey
  const parsed = parseLicense(license, publicKeys, host)
  if (!parsed.ok) return {parsed, usage: {ok: false, error: 'there is no valid license'}}
  if (!parsed.claims.publicUsageKey) {
    return {parsed, usage: {ok: false, error: 'the license names no public usage key'}}
  }
  const privateUsageKey = parts[2]
  if (!privateUsageKey) {
    return {parsed, usage: {ok: false, error: 'PRIVATE_LICENSE_KEY has no private usage key'}}
  }
  if (publicUsageKeyOf(privateUsageKey) !== parsed.claims.publicUsageKey) {
    return {
      parsed,
      usage: {
        ok: false,
        error: 'the private usage key isn’t the pair of the public usage key the license names'
      }
    }
  }
  return {parsed, usage: {ok: true, privateUsageKey, license: license!.trim()}}
}

export interface UsageReportOrganization {
  id: string
  name: string
  activeUsers: number
}

export interface UsageReportFacilitator {
  name: string
  email: string
  /** Still an active member of an organization on the instance */
  active: boolean
  /** Meetings they facilitated that 2 or more people joined, by meeting type as Reports names it, such as Check-in */
  meetings: Record<string, number>
  total: number
}

export interface UsageReportFacilitators {
  /** How many people each list holds: a tenth of the active users, rounded up */
  limit: number
  last90Days: UsageReportFacilitator[]
  sinceLicenseIssued: UsageReportFacilitator[]
}

export interface UsageReportClaims {
  v: 1
  type: 'usage'
  /** The instance's license, `<payload>.<signature>`, which names the public usage key that checks the report */
  license: string
  /** Parabol's HOST */
  host: string
  /** ISO 8601 */
  generatedAt: string
  /** Users active now on the instance, each counted once */
  activeUsers: number
  /** Every organization on the instance, with its active users now */
  organizations: UsageReportOrganization[]
  /** For each month since the license was issued, as YYYY-MM in UTC: the most users active on any day of it */
  monthlyPeaks: Record<string, number>
  /** Who ran the most meetings, when the license's usageReports is 'user-activity' */
  topFacilitators?: UsageReportFacilitators
}

/** Signs a usage report with the instance's private usage key: `<payload>.<signature>` */
export const signUsageReport = (report: UsageReportClaims, privateUsageKey: string) => {
  const payload = base64url(Buffer.from(JSON.stringify(report)))
  const signature = sign(null, Buffer.from(payload), privateUsageKeyObject(privateUsageKey))
  return `${payload}.${base64url(signature)}`
}
