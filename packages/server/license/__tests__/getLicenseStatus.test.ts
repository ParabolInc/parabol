import {getLicenseStatus} from '../getLicenseStatus'
import type {LicenseClaims} from '../licenseToken'

const claims: LicenseClaims = {
  v: 1,
  kid: 'test',
  id: 'lic_1',
  customer: 'Acme',
  tier: 'enterprise',
  seats: 10,
  issuedAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2027-01-01T00:00:00.000Z'
}
const valid = {ok: true as const, claims}
const at = (iso: string) => new Date(iso)

describe('getLicenseStatus', () => {
  test('a current license grants its tier', () => {
    const s = getLicenseStatus({
      parsed: valid,
      now: at('2026-06-01'),
      unlicensedSince: null,
      needsLicense: true,
      activeSeats: 10
    })
    expect(s).toMatchObject({state: 'valid', maxTier: 'enterprise', overSeats: false})
  })

  test('warns within 30 days of expiry', () => {
    const s = getLicenseStatus({
      parsed: valid,
      now: at('2026-12-15'),
      unlicensedSince: null,
      needsLicense: true
    })
    expect(s).toMatchObject({state: 'expiring', maxTier: 'enterprise'})
  })

  test('keeps the tier for 30 days after expiry, then drops to Starter', () => {
    const inGrace = getLicenseStatus({
      parsed: valid,
      now: at('2027-01-20'),
      unlicensedSince: null,
      needsLicense: true
    })
    expect(inGrace).toMatchObject({state: 'expired', maxTier: 'enterprise'})
    expect(inGrace.graceEndsAt?.toISOString()).toBe('2027-01-31T00:00:00.000Z')
    const after = getLicenseStatus({
      parsed: valid,
      now: at('2027-02-01'),
      unlicensedSince: null,
      needsLicense: true
    })
    expect(after).toMatchObject({state: 'expired', maxTier: null})
  })

  test('a license without expiry never expires', () => {
    const forever = {ok: true as const, claims: {...claims, expiresAt: undefined}}
    const s = getLicenseStatus({
      parsed: forever,
      now: at('2040-01-01'),
      unlicensedSince: null,
      needsLicense: true
    })
    expect(s).toMatchObject({state: 'valid', maxTier: 'enterprise'})
  })

  test('without a license, paid features last 30 days from when it was first missed', () => {
    const missing = {ok: false as const, reason: 'missing' as const}
    const inGrace = getLicenseStatus({
      parsed: missing,
      now: at('2026-06-10'),
      unlicensedSince: at('2026-06-01'),
      needsLicense: true
    })
    expect(inGrace).toMatchObject({state: 'missing', maxTier: 'enterprise'})
    expect(inGrace.graceEndsAt?.toISOString()).toBe('2026-07-01T00:00:00.000Z')
    const after = getLicenseStatus({
      parsed: missing,
      now: at('2026-07-02'),
      unlicensedSince: at('2026-06-01'),
      needsLicense: true
    })
    expect(after).toMatchObject({state: 'missing', maxTier: null})
  })

  test('an invalid license is treated like a missing one, with its reason', () => {
    const s = getLicenseStatus({
      parsed: {ok: false, reason: 'invalid', error: 'the signature does not match'},
      now: at('2026-06-10'),
      unlicensedSince: at('2026-04-01'),
      needsLicense: true
    })
    expect(s).toMatchObject({
      state: 'invalid',
      maxTier: null,
      error: 'the signature does not match'
    })
  })

  test('flags more active users than seats', () => {
    const s = getLicenseStatus({
      parsed: valid,
      now: at('2026-06-01'),
      unlicensedSince: null,
      needsLicense: true,
      activeSeats: 11
    })
    expect(s).toMatchObject({overSeats: true, maxTier: 'enterprise'})
  })
})
