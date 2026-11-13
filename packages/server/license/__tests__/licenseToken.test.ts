import {createPublicKey, verify} from 'node:crypto'
import {
  isHostCovered,
  type LicenseClaims,
  parseLicense,
  parsePrivateLicenseKey,
  signUsageReport,
  type UsageReportClaims,
  usageReportLevelOf
} from '../licenseToken'
import {makeSigningKeys, makeUsageKeys, signLicense} from './licenseFixtures'

const keys = makeSigningKeys()
const publicKeys = {test: keys.publicPem}
const usage = makeUsageKeys()
const claims: LicenseClaims = {
  v: 1,
  kid: 'test',
  id: 'lic_1',
  customer: 'Acme',
  seats: 50,
  hosts: ['parabol.acme.mil'],
  issuedAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2027-11-01T00:00:00.000Z',
  publicUsageKey: usage.publicUsageKey
}
const HOST = 'parabol.acme.mil'
const signed = (overrides: Record<string, unknown>) =>
  signLicense({...claims, ...overrides}, keys.privatePem)

describe('parseLicense', () => {
  test('accepts a license Parabol signed, on a host it covers', () => {
    const license = signLicense(claims, keys.privatePem)
    expect(parseLicense(license, publicKeys, HOST)).toEqual({ok: true, claims})
  })

  test('accepts a license signed with a post-quantum ML-DSA-44 key', () => {
    const pq = makeSigningKeys('ml-dsa-44')
    const license = signLicense(claims, pq.privatePem)
    expect(parseLicense(license, {test: pq.publicPem}, HOST)).toEqual({ok: true, claims})
  })

  test('reports no license as missing', () => {
    expect(parseLicense(undefined, publicKeys, 'x')).toEqual({ok: false, reason: 'missing'})
    expect(parseLicense('  ', publicKeys, 'x')).toEqual({ok: false, reason: 'missing'})
  })

  test('rejects a license whose payload was changed', () => {
    const [payload, signature] = signLicense(claims, keys.privatePem).split('.')
    const changed = Buffer.from(
      JSON.stringify({...JSON.parse(Buffer.from(payload!, 'base64url').toString()), seats: 5000})
    ).toString('base64url')
    expect(parseLicense(`${changed}.${signature}`, publicKeys, HOST)).toMatchObject({
      ok: false,
      reason: 'invalid',
      error: 'the signature does not match'
    })
  })

  test('rejects a license signed with someone else’s key under Parabol’s key ID', () => {
    const forged = signLicense(claims, makeSigningKeys().privatePem)
    expect(parseLicense(forged, publicKeys, HOST)).toMatchObject({
      ok: false,
      error: 'the signature does not match'
    })
  })

  test('rejects an unknown key ID and malformed licenses', () => {
    expect(parseLicense(signed({kid: 'other'}), publicKeys, HOST)).toMatchObject({
      ok: false,
      error: 'unknown signing key other'
    })
    expect(parseLicense('not-a-license', publicKeys, 'x')).toMatchObject({
      ok: false,
      reason: 'invalid'
    })
    expect(parseLicense('a.b.c', publicKeys, 'x')).toMatchObject({ok: false, reason: 'invalid'})
  })

  test('rejects signed claims that make no sense', () => {
    const errorOf = (overrides: Record<string, unknown>) => {
      const result = parseLicense(signed(overrides), publicKeys, HOST)
      return result.ok ? undefined : result.error
    }
    expect(errorOf({seats: 0})).toBe('seats must be a positive integer')
    expect(errorOf({hosts: []})).toBe('hosts must be a non-empty list of hostnames')
    expect(errorOf({expiresAt: 'soon'})).toBe('expiresAt is not a date')
    expect(errorOf({publicUsageKey: 'abc'})).toBe('publicUsageKey is not an Ed25519 public key')
    expect(errorOf({v: 2})).toBe('unsupported version 2')
    expect(errorOf({usageReports: true})).toBe('usageReports must be text')
    expect(errorOf({type: 1})).toBe('type must be text')
    expect(errorOf({onExpiry: ['read-only']})).toBe('onExpiry must be text')
    expect(errorOf({expiresAt: undefined, seats: undefined})).toBe(undefined)
  })

  test('ignores fields it doesn’t know, so later licenses work on this version', () => {
    const result = parseLicense(
      signed({onOverSeats: [{from: '30d', action: 'read-only'}], futureTerm: true}),
      publicKeys,
      HOST
    )
    expect(result).toMatchObject({ok: true, claims: {customer: 'Acme'}})
  })

  test('rejects a license for another host', () => {
    const license = signLicense(claims, keys.privatePem)
    expect(parseLicense(license, publicKeys, 'parabol.other.mil')).toMatchObject({
      ok: false,
      reason: 'invalid',
      error: 'it covers parabol.acme.mil, not parabol.other.mil'
    })
  })
})

describe('isHostCovered', () => {
  test('matches hostnames, ignoring case and port, with *. wildcards', () => {
    expect(isHostCovered(undefined, undefined)).toBe(true)
    expect(isHostCovered(['parabol.acme.mil'], 'Parabol.Acme.mil:443')).toBe(true)
    expect(isHostCovered(['*.acme.mil'], 'retro.acme.mil')).toBe(true)
    expect(isHostCovered(['*.acme.mil'], 'acme.mil')).toBe(false)
    expect(isHostCovered(['*.acme.mil'], 'evilacme.mil')).toBe(false)
    expect(isHostCovered(['parabol.acme.mil'], undefined)).toBe(false)
  })
})

describe('parsePrivateLicenseKey', () => {
  const license = signLicense(claims, keys.privatePem)

  test('splits off the private usage key that pairs with the license’s public usage key', () => {
    const result = parsePrivateLicenseKey(`${license}.${usage.privateUsageKey}`, publicKeys, HOST)
    expect(result.parsed).toEqual({ok: true, claims})
    expect(result.usage).toEqual({ok: true, privateUsageKey: usage.privateUsageKey, license})
  })

  test('keeps a license without a private usage key, but can’t sign reports', () => {
    const result = parsePrivateLicenseKey(license, publicKeys, HOST)
    expect(result.parsed.ok).toBe(true)
    expect(result.usage).toEqual({ok: false, error: 'PRIVATE_LICENSE_KEY has no private usage key'})
  })

  test('refuses a private usage key that isn’t the pair of the license’s public one', () => {
    const other = makeUsageKeys()
    const result = parsePrivateLicenseKey(`${license}.${other.privateUsageKey}`, publicKeys, HOST)
    expect(result.parsed.ok).toBe(true)
    expect(result.usage.ok).toBe(false)
    expect(parsePrivateLicenseKey(`${license}.garbage`, publicKeys, HOST).usage.ok).toBe(false)
  })

  test('a license that names no public usage key can’t sign reports', () => {
    const noUsage = signed({publicUsageKey: undefined})
    expect(
      parsePrivateLicenseKey(`${noUsage}.${usage.privateUsageKey}`, publicKeys, HOST).usage
    ).toEqual({ok: false, error: 'the license names no public usage key'})
  })
})

describe('signUsageReport', () => {
  test('signs with the private usage key, so the license’s public usage key checks it', () => {
    const license = signLicense(claims, keys.privatePem)
    const report: UsageReportClaims = {
      v: 1,
      type: 'usage',
      license,
      host: HOST,
      generatedAt: '2026-12-01T15:04:00.000Z',
      activeUsers: 231,
      organizations: [{id: 'org1', name: 'Acme', activeUsers: 231}],
      monthlyPeaks: {'2026-11': 236, '2026-12': 231}
    }
    const [payload, signature] = signUsageReport(report, usage.privateUsageKey).split('.')
    expect(JSON.parse(Buffer.from(payload!, 'base64url').toString())).toEqual(report)
    const publicUsageKey = createPublicKey({
      key: {kty: 'OKP', crv: 'Ed25519', x: usage.publicUsageKey},
      format: 'jwk'
    })
    const checks = (data: string) =>
      verify(null, Buffer.from(data), publicUsageKey, Buffer.from(signature!, 'base64url'))
    expect(checks(payload!)).toBe(true)
    expect(checks(`${payload}x`)).toBe(false)
  })
})

describe('usageReportLevelOf', () => {
  test('needs a public usage key and a level', () => {
    expect(usageReportLevelOf({...claims, usageReports: 'user-activity'})).toBe('user-activity')
    expect(usageReportLevelOf({...claims, usageReports: 'user-count'})).toBe('user-count')
    expect(usageReportLevelOf({...claims, usageReports: 'something-new'})).toBe('user-count')
    expect(usageReportLevelOf({...claims, usageReports: ''})).toBe('')
    expect(
      usageReportLevelOf({...claims, usageReports: 'user-count', publicUsageKey: undefined})
    ).toBe('')
  })
})
