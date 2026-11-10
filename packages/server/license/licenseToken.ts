import {createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify} from 'node:crypto'

/*
A license lets the instance's organizations keep a paid tier without a Stripe subscription, and says what happens
around its expiry and while more users are active than it covers.

A license key, the LICENSE_KEY environment variable, is three base64url parts separated by dots:
`<payload>.<signature>.<usage key>`.
- The payload is the license's JSON, and the signature is Parabol's Ed25519 signature of the payload's base64url
  text, checked against the public keys in licensePublicKeys.ts, picked by `kid`. Together they're the license.
- The usage key is the private half of the instance's own Ed25519 key, whose public half the license names as
  `usageKey`. It signs usage reports, which carry the license, so Parabol checks a report with its own public key
  alone. The usage key isn't part of the license, so a report never carries it.

This file imports nothing relative, so Parabol's scripts can import it as it is.
*/

export type LicenseNoticeAudience = 'none' | 'admins' | 'everyone'
/** What a step does besides its notice. read-only: people can see everything, and change nothing */
export type LicenseAction = 'read-only'

/** A step in what happens once a license nears or passes its expiry, or once more users are active than it covers */
export interface LicenseStage {
  /** When the step starts, in days after the condition began, such as '90d', or before it, such as '-30d' */
  from: string
  /** Who sees a notice: nobody, the admins of the organizations that depend on the license, or all their members */
  notice: LicenseNoticeAudience
  /** What happens to the instance. Absent: nothing besides the notice */
  action?: LicenseAction
}

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
  /** What happens around expiry, counted from expiresAt. The last step whose `from` has passed applies. []: nothing */
  onExpiry: LicenseStage[]
  /** What happens while more users are active than it covers, counted from when that began. []: nothing */
  onOverSeats: LicenseStage[]
  /** The public half of the instance's usage key: a raw Ed25519 key in base64url. Absent: no usage reports */
  usageKey?: string
  /**
   * Parabol's own cloud: the license only keeps organizations without a Stripe subscription on their paid tier. New
   * organizations start on Starter, and there are no usage reports. Absent: an enterprise instance
   */
  saas?: true
}

export type LicenseParseResult =
  | {ok: true; claims: LicenseClaims}
  | {ok: false; reason: 'missing' | 'invalid'; error?: string}

const DAY_MS = 24 * 60 * 60 * 1000
const base64url = (buf: Buffer) => buf.toString('base64url')
const isIsoDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value))

/** A stage's `from` in milliseconds, or undefined when it isn't a whole number of days such as '90d' or '-30d' */
export const stageOffsetMs = (from: unknown) => {
  const match = typeof from === 'string' ? /^(-?\d+)d$/.exec(from) : null
  return match ? Number(match[1]) * DAY_MS : undefined
}

const NOTICE_AUDIENCES: readonly unknown[] = ['none', 'admins', 'everyone']
const ACTIONS: readonly unknown[] = ['read-only']

const checkStages = (stages: unknown, name: string): string | undefined => {
  if (!Array.isArray(stages)) return `${name} must be a list, [] for nothing`
  let previous = -Infinity
  for (const stage of stages) {
    if (!stage || typeof stage !== 'object') return `${name} has a step that isn't an object`
    const offset = stageOffsetMs(stage.from)
    if (offset === undefined)
      return `${name} has a from of ${stage.from}, not days such as 90d or -30d`
    if (offset <= previous) return `${name}'s steps must go from earliest to latest`
    previous = offset
    if (!NOTICE_AUDIENCES.includes(stage.notice)) {
      return `${name} has a notice of ${stage.notice}, not none, admins or everyone`
    }
    if (stage.action !== undefined && !ACTIONS.includes(stage.action)) {
      return `${name} has an action of ${stage.action}, not read-only`
    }
  }
  return undefined
}

const ED25519_PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex')
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex')

const rawKey = (key: string) => {
  const raw = Buffer.from(key, 'base64url')
  if (raw.length !== 32) throw new Error('an Ed25519 key is 32 bytes')
  return raw
}
const usagePrivateKey = (key: string) =>
  createPrivateKey({
    key: Buffer.concat([ED25519_PKCS8_PREFIX, rawKey(key)]),
    format: 'der',
    type: 'pkcs8'
  })
const usagePublicKey = (key: string) =>
  createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, rawKey(key)]),
    format: 'der',
    type: 'spki'
  })

/** A new usage key pair, each half a raw Ed25519 key in base64url */
export const generateUsageKeyPair = () => {
  const jwk = generateKeyPairSync('ed25519').privateKey.export({format: 'jwk'})
  return {privateKey: jwk.d!, publicKey: jwk.x!}
}

/** The public half of a usage key, or undefined when it isn't one */
export const usagePublicKeyOf = (privateKey: string) => {
  try {
    return createPublicKey(usagePrivateKey(privateKey)).export({format: 'jwk'}).x
  } catch {
    return undefined
  }
}

/** What's wrong with a license's claims, or undefined when nothing is */
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
  const stagesError =
    checkStages(claims.onExpiry, 'onExpiry') ?? checkStages(claims.onOverSeats, 'onOverSeats')
  if (stagesError) return stagesError
  if (claims.onExpiry.length > 0 && claims.expiresAt === undefined) {
    return 'onExpiry has steps, but the license never expires'
  }
  if (claims.onOverSeats.length > 0 && claims.seats === undefined) {
    return 'onOverSeats has steps, but the license covers any number of users'
  }
  if (claims.saas !== undefined && claims.saas !== true) return 'saas is true or absent'
  if (claims.usageKey !== undefined) {
    try {
      usagePublicKey(claims.usageKey)
    } catch {
      return 'usageKey is not an Ed25519 public key'
    }
  }
  return undefined
}

export const signLicense = (claims: LicenseClaims, privateKeyPem: string) => {
  const payload = base64url(Buffer.from(JSON.stringify(claims)))
  const signature = sign(null, Buffer.from(payload), createPrivateKey(privateKeyPem))
  return `${payload}.${base64url(signature)}`
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
  token: string | undefined,
  publicKeys: Record<string, string>,
  host: string | undefined
): LicenseParseResult => {
  const trimmed = token?.trim()
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

export type UsageKeyResult =
  | {ok: true; privateKey: string; license: string}
  | {ok: false; error: string}

/** Splits a license key into the license, checked as parseLicense checks it, and the usage key that signs reports */
export const parseLicenseKey = (
  licenseKey: string | undefined,
  publicKeys: Record<string, string>,
  host: string | undefined
): {parsed: LicenseParseResult; usage: UsageKeyResult} => {
  const parts = licenseKey?.trim().split('.') ?? []
  const license = parts.length === 3 ? `${parts[0]}.${parts[1]}` : licenseKey
  const parsed = parseLicense(license, publicKeys, host)
  if (!parsed.ok) return {parsed, usage: {ok: false, error: 'there is no valid license'}}
  if (!parsed.claims.usageKey) {
    return {parsed, usage: {ok: false, error: 'the license names no usage key'}}
  }
  const privateKey = parts[2]
  if (!privateKey) return {parsed, usage: {ok: false, error: 'the license key has no usage key'}}
  if (usagePublicKeyOf(privateKey) !== parsed.claims.usageKey) {
    return {
      parsed,
      usage: {ok: false, error: 'the license key’s usage key isn’t the one its license names'}
    }
  }
  return {parsed, usage: {ok: true, privateKey, license: license!.trim()}}
}

export interface UsageReportOrganization {
  id: string
  name: string
  activeUsers: number
}

export interface UsageReportClaims {
  v: 1
  type: 'usage'
  /** The instance's license, `<payload>.<signature>`, which names the key that signed the report */
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
}

export type UsageReportVerifyResult =
  | {ok: true; report: UsageReportClaims; license: LicenseClaims}
  | {ok: false; error: string}

/** Signs a usage report with the instance's usage key: `<payload>.<signature>` */
export const signUsageReport = (report: UsageReportClaims, usageKey: string) => {
  const payload = base64url(Buffer.from(JSON.stringify(report)))
  const signature = sign(null, Buffer.from(payload), usagePrivateKey(usageKey))
  return `${payload}.${base64url(signature)}`
}

const isCount = (value: unknown) => Number.isInteger(value) && (value as number) >= 0

/**
 * Checks a signed usage report: that its license is one Parabol signed, and that the usage key the license names
 * signed the report, so nothing in it changed after it was made
 */
export const verifyUsageReport = (
  token: string,
  publicKeys: Record<string, string>
): UsageReportVerifyResult => {
  const parts = token.trim().split('.')
  if (parts.length !== 2) return {ok: false, error: 'it is not a signed usage report'}
  const [payload, signature] = parts as [string, string]
  let report: any
  try {
    report = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return {ok: false, error: 'the payload is not JSON'}
  }
  if (report?.v !== 1 || report.type !== 'usage')
    return {ok: false, error: 'it is not a usage report'}
  const license = parseLicense(report.license, publicKeys, report.host)
  if (!license.ok) {
    return {ok: false, error: `its license is invalid: ${license.error ?? license.reason}`}
  }
  const {usageKey} = license.claims
  if (!usageKey) return {ok: false, error: 'its license names no usage key'}
  let signatureOk = false
  try {
    signatureOk = verify(
      null,
      Buffer.from(payload),
      usagePublicKey(usageKey),
      Buffer.from(signature, 'base64url')
    )
  } catch {
    signatureOk = false
  }
  if (!signatureOk) {
    return {
      ok: false,
      error: 'the signature does not match: the report was changed, or another key signed it'
    }
  }
  const wellFormed =
    isIsoDate(report.generatedAt) &&
    isCount(report.activeUsers) &&
    Array.isArray(report.organizations) &&
    report.organizations.every(
      (org: any) => typeof org?.id === 'string' && isCount(org.activeUsers)
    ) &&
    report.monthlyPeaks &&
    typeof report.monthlyPeaks === 'object' &&
    Object.values(report.monthlyPeaks).every(isCount)
  if (!wellFormed) return {ok: false, error: 'the report is missing fields'}
  return {ok: true, report, license: license.claims}
}
