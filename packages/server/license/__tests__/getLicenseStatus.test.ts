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
  expiresAt: '2027-01-01T00:00:00.000Z',
  onExpiry: [
    {from: '-30d', notice: 'admins'},
    {from: '90d', notice: 'admins', tier: 'team'},
    {from: '180d', notice: 'everyone', tier: 'starter'}
  ],
  onOverSeats: [{from: '14d', notice: 'admins'}]
}
const at = (iso: string) => new Date(iso)
const status = (
  overrides: Partial<Parameters<typeof getLicenseStatus>[0]> & {claims?: Partial<LicenseClaims>}
) => {
  const {claims: claimOverrides, ...input} = overrides
  return getLicenseStatus({
    parsed: {ok: true, claims: {...claims, ...claimOverrides}},
    now: at('2026-06-01'),
    unlicensedSince: null,
    needsLicense: true,
    ...input
  })
}

describe('getLicenseStatus', () => {
  test('a current license grants its tier, with no step started', () => {
    const s = status({activeSeats: 10})
    expect(s).toMatchObject({state: 'valid', maxTier: 'enterprise', overSeats: false})
    expect(s.expiry?.stage).toBeUndefined()
    expect(s.expiry?.nextDrop).toEqual({at: at('2027-04-01'), tier: 'team'})
  })

  test('a step before expiry starts on its day', () => {
    expect(status({now: at('2026-12-01')}).expiry?.stage).toBeUndefined()
    const s = status({now: at('2026-12-02')})
    expect(s).toMatchObject({state: 'valid', maxTier: 'enterprise'})
    expect(s.expiry?.stage).toEqual({from: '-30d', notice: 'admins'})
  })

  test('after expiry, the last step that has started applies', () => {
    const justExpired = status({now: at('2027-01-01')})
    expect(justExpired).toMatchObject({state: 'expired', maxTier: 'enterprise'})
    expect(justExpired.expiry?.stage?.from).toBe('-30d')
    const toTeam = status({now: at('2027-04-01')})
    expect(toTeam).toMatchObject({state: 'expired', maxTier: 'team'})
    expect(toTeam.expiry?.nextDrop).toEqual({at: at('2027-06-30'), tier: 'starter'})
    const toStarter = status({now: at('2027-07-01')})
    expect(toStarter).toMatchObject({maxTier: null})
    expect(toStarter.expiry?.stage?.notice).toBe('everyone')
  })

  test('a license with no expiry steps keeps its tier after expiry, quietly', () => {
    const s = status({now: at('2030-01-01'), claims: {onExpiry: []}})
    expect(s).toMatchObject({state: 'expired', maxTier: 'enterprise'})
    expect(s.expiry).toEqual({})
  })

  test('a license without expiry never expires', () => {
    const s = status({now: at('2040-01-01'), claims: {expiresAt: undefined, onExpiry: []}})
    expect(s).toMatchObject({state: 'valid', maxTier: 'enterprise'})
    expect(s.expiry).toBeUndefined()
  })

  test('over the seats, the timeline counts from when that began', () => {
    const early = status({activeSeats: 12, overSeatsSince: at('2026-05-25')})
    expect(early).toMatchObject({overSeats: true, maxTier: 'enterprise'})
    expect(early.overSeatsTimeline?.stage).toBeUndefined()
    const later = status({activeSeats: 12, overSeatsSince: at('2026-05-18')})
    expect(later.overSeatsTimeline?.stage).toEqual({from: '14d', notice: 'admins'})
    const within = status({activeSeats: 10, overSeatsSince: at('2026-01-01')})
    expect(within).toMatchObject({overSeats: false})
    expect(within.overSeatsTimeline).toBeUndefined()
  })

  test('the lowest tier any started step sets wins', () => {
    const s = status({
      now: at('2027-04-02'),
      activeSeats: 20,
      overSeatsSince: at('2027-01-01'),
      claims: {onOverSeats: [{from: '0d', notice: 'none', tier: 'starter'}]}
    })
    expect(s.maxTier).toBeNull()
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
      now: at('2026-06-01'),
      unlicensedSince: null,
      needsLicense: true
    })
    expect(s).toMatchObject({
      state: 'invalid',
      maxTier: 'enterprise',
      error: 'the signature does not match'
    })
  })
})
