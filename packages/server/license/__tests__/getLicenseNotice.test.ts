import {getLicenseNotice} from '../getLicenseNotice'
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
const status = (overrides: Partial<Parameters<typeof getLicenseStatus>[0]>) =>
  getLicenseStatus({
    parsed: {ok: true, claims},
    now: new Date('2026-06-01'),
    unlicensedSince: null,
    needsLicense: true,
    ...overrides
  })

describe('getLicenseNotice', () => {
  test('says nothing about a current license, or a missing one nobody needs', () => {
    expect(getLicenseNotice(status({activeSeats: 3}))).toBeNull()
    expect(
      getLicenseNotice(status({parsed: {ok: false, reason: 'missing'}, needsLicense: false}))
    ).toBeNull()
  })

  test('warns about a missing license with the day paid features end', () => {
    const notice = getLicenseNotice(
      status({
        parsed: {ok: false, reason: 'missing'},
        unlicensedSince: new Date('2026-05-20')
      })
    )
    expect(notice).toEqual({
      kind: 'MISSING',
      graceEndsAt: new Date('2026-06-19'),
      message:
        'This Parabol instance has no license. Organizations without a subscription keep their paid features until 2026-06-19. Contact Parabol for a license.'
    })
  })

  test('says Starter once the grace period is over', () => {
    const notice = getLicenseNotice(
      status({now: new Date('2027-03-01'), parsed: {ok: true, claims}})
    )
    expect(notice?.kind).toBe('EXPIRED')
    expect(notice?.message).toContain('have Starter features')
  })

  test('puts expiry before seats, and seats before an upcoming expiry', () => {
    expect(getLicenseNotice(status({now: new Date('2026-12-20'), activeSeats: 20}))?.kind).toBe(
      'OVER_SEATS'
    )
    expect(getLicenseNotice(status({now: new Date('2026-12-20'), activeSeats: 5}))?.kind).toBe(
      'EXPIRING'
    )
  })
})
