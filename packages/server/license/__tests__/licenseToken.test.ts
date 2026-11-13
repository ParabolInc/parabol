import {generateKeyPairSync} from 'node:crypto'
import {
  generateUsageKeyPair,
  isHostCovered,
  type LicenseClaims,
  parseLicense,
  parseLicenseKey,
  signLicense,
  signUsageReport,
  type UsageReportClaims,
  verifyUsageReport
} from '../licenseToken'

const makeKeys = () => {
  const {privateKey, publicKey} = generateKeyPairSync('ed25519')
  return {
    privatePem: privateKey.export({type: 'pkcs8', format: 'pem'}).toString(),
    publicPem: publicKey.export({type: 'spki', format: 'pem'}).toString()
  }
}

const keys = makeKeys()
const publicKeys = {test: keys.publicPem}
const usage = generateUsageKeyPair()
const claims: LicenseClaims = {
  v: 1,
  kid: 'test',
  id: 'lic_1',
  customer: 'Acme',
  seats: 50,
  hosts: ['parabol.acme.mil'],
  issuedAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2027-11-01T00:00:00.000Z',
  usageKey: usage.publicKey
}
const HOST = 'parabol.acme.mil'
const signed = (overrides: Partial<LicenseClaims> | Record<string, unknown>) =>
  signLicense({...claims, ...overrides} as LicenseClaims, keys.privatePem)

describe('parseLicense', () => {
  test('accepts a license Parabol signed, on a host it covers', () => {
    const token = signLicense(claims, keys.privatePem)
    expect(parseLicense(token, publicKeys, HOST)).toEqual({ok: true, claims})
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
    const result = parseLicense(`${changed}.${signature}`, publicKeys, HOST)
    expect(result).toMatchObject({
      ok: false,
      reason: 'invalid',
      error: 'the signature does not match'
    })
  })

  test('rejects a license signed with someone else’s key under Parabol’s key ID', () => {
    const forged = signLicense(claims, makeKeys().privatePem)
    expect(parseLicense(forged, publicKeys, HOST)).toMatchObject({
      ok: false,
      error: 'the signature does not match'
    })
  })

  test('rejects an unknown key ID and malformed tokens', () => {
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
    expect(errorOf({usageKey: 'abc'})).toBe('usageKey is not an Ed25519 public key')
    expect(errorOf({v: 2})).toBe('unsupported version 2')
    expect(errorOf({expiresAt: undefined, seats: undefined})).toBe(undefined)
  })

  test('ignores fields it doesn’t know, so later licenses work on this version', () => {
    const result = parseLicense(
      signed({onExpiry: [{from: '30d', action: 'read-only'}], futureTerm: true}),
      publicKeys,
      HOST
    )
    expect(result).toMatchObject({ok: true, claims: {customer: 'Acme'}})
  })

  test('rejects a license for another host', () => {
    const token = signLicense(claims, keys.privatePem)
    expect(parseLicense(token, publicKeys, 'parabol.other.mil')).toMatchObject({
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

describe('parseLicenseKey', () => {
  const license = signLicense(claims, keys.privatePem)

  test('splits off the usage key the license names', () => {
    const {parsed, usage: usageKey} = parseLicenseKey(
      `${license}.${usage.privateKey}`,
      publicKeys,
      HOST
    )
    expect(parsed).toEqual({ok: true, claims})
    expect(usageKey).toEqual({ok: true, privateKey: usage.privateKey, license})
  })

  test('keeps the license without a usage key, but can’t sign reports', () => {
    const {parsed, usage: usageKey} = parseLicenseKey(license, publicKeys, HOST)
    expect(parsed.ok).toBe(true)
    expect(usageKey).toEqual({ok: false, error: 'the license key has no usage key'})
  })

  test('refuses a usage key other than the one the license names', () => {
    const other = generateUsageKeyPair()
    const {parsed, usage: usageKey} = parseLicenseKey(
      `${license}.${other.privateKey}`,
      publicKeys,
      HOST
    )
    expect(parsed.ok).toBe(true)
    expect(usageKey.ok).toBe(false)
    expect(parseLicenseKey(`${license}.garbage`, publicKeys, HOST).usage.ok).toBe(false)
  })

  test('a license that names no usage key can’t sign reports', () => {
    const noUsage = signed({usageKey: undefined})
    expect(parseLicenseKey(`${noUsage}.${usage.privateKey}`, publicKeys, HOST).usage).toEqual({
      ok: false,
      error: 'the license names no usage key'
    })
  })
})

describe('usage reports', () => {
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
  const tamper = (token: string, change: Partial<UsageReportClaims>) => {
    const [payload, signature] = token.split('.')
    const changed = {...JSON.parse(Buffer.from(payload!, 'base64url').toString()), ...change}
    return `${Buffer.from(JSON.stringify(changed)).toString('base64url')}.${signature}`
  }

  test('a report the license’s usage key signed is genuine', () => {
    const token = signUsageReport(report, usage.privateKey)
    expect(verifyUsageReport(token, publicKeys)).toEqual({ok: true, report, license: claims})
  })

  test('a changed report is not', () => {
    const token = signUsageReport(report, usage.privateKey)
    expect(verifyUsageReport(tamper(token, {activeUsers: 40}), publicKeys)).toMatchObject({
      ok: false
    })
  })

  test('a report signed with another usage key is not', () => {
    const token = signUsageReport(report, generateUsageKeyPair().privateKey)
    expect(verifyUsageReport(token, publicKeys)).toMatchObject({ok: false})
  })

  test('a report whose license Parabol didn’t sign is not', () => {
    const forger = makeKeys()
    const forgedUsage = generateUsageKeyPair()
    const forgedLicense = signLicense(
      {...claims, usageKey: forgedUsage.publicKey},
      forger.privatePem
    )
    const token = signUsageReport({...report, license: forgedLicense}, forgedUsage.privateKey)
    expect(verifyUsageReport(token, publicKeys)).toEqual({
      ok: false,
      error: 'its license is invalid: the signature does not match'
    })
  })

  test('a license key’s usage key signs reports that verify', () => {
    const {usage: usageKey} = parseLicenseKey(`${license}.${usage.privateKey}`, publicKeys, HOST)
    if (!usageKey.ok) throw new Error(usageKey.error)
    const token = signUsageReport({...report, license: usageKey.license}, usageKey.privateKey)
    expect(verifyUsageReport(token, publicKeys).ok).toBe(true)
    expect(verifyUsageReport('junk', publicKeys)).toEqual({
      ok: false,
      error: 'it is not a signed usage report'
    })
  })
})
