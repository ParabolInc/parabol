import {getLicenseNotice, getReadOnlyMessage} from '../getLicenseNotice'
import {getLicenseStatus} from '../getLicenseStatus'
import type {LicenseClaims} from '../licenseToken'

const claims: LicenseClaims = {
  v: 1,
  kid: 'test',
  id: 'lic_1',
  customer: 'Acme',
  seats: 10,
  issuedAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2027-01-01T00:00:00.000Z',
  onExpiry: [
    {from: '-30d', notice: 'admins'},
    {from: '0d', notice: 'none'},
    {from: '90d', notice: 'admins'},
    {from: '180d', notice: 'everyone', action: 'read-only'}
  ],
  onOverSeats: [{from: '0d', notice: 'admins'}]
}
const status = (
  overrides: Partial<Parameters<typeof getLicenseStatus>[0]> & {claims?: Partial<LicenseClaims>}
) => {
  const {claims: claimOverrides, ...input} = overrides
  return getLicenseStatus({
    parsed: {ok: true, claims: {...claims, ...claimOverrides}},
    now: new Date('2026-06-01'),
    unlicensedSince: null,
    needsLicense: true,
    ...input
  })
}

describe('getLicenseNotice', () => {
  test('says nothing about a current license, or about one nobody needs', () => {
    expect(getLicenseNotice(status({activeSeats: 3}))).toBeNull()
    expect(
      getLicenseNotice(status({parsed: {ok: false, reason: 'missing'}, needsLicense: false}))
    ).toBeNull()
    expect(getLicenseNotice(status({now: new Date('2027-08-01'), needsLicense: false}))).toBeNull()
  })

  test('warns admins before expiry, with when Parabol turns read-only', () => {
    expect(getLicenseNotice(status({now: new Date('2026-12-15')}))).toEqual({
      kind: 'EXPIRING',
      audience: 'admins',
      message:
        "This Parabol instance's license expires on 2027-01-01. From 2027-06-30, Parabol will be read-only. Contact Parabol to renew it.",
      graceEndsAt: new Date('2027-06-30')
    })
  })

  test('follows each step: quiet after expiry, admins at 90 days, everyone at 180', () => {
    expect(getLicenseNotice(status({now: new Date('2027-02-01')}))).toBeNull()
    expect(getLicenseNotice(status({now: new Date('2027-04-15')}))).toMatchObject({
      kind: 'EXPIRED',
      audience: 'admins'
    })
    expect(getLicenseNotice(status({now: new Date('2027-07-01')}))).toEqual({
      kind: 'EXPIRED',
      audience: 'everyone',
      message:
        "This Parabol instance's license expired on 2027-01-01. Parabol is read-only: everyone can see their work, but nothing can be changed. Contact Parabol to renew it.",
      graceEndsAt: null
    })
  })

  test('warns about seats as the license says', () => {
    expect(getLicenseNotice(status({activeSeats: 12}))).toEqual({
      kind: 'OVER_SEATS',
      audience: 'admins',
      message:
        'This Parabol instance has 12 active users; its license covers 10. Contact Parabol to add seats.',
      graceEndsAt: null
    })
    expect(getLicenseNotice(status({activeSeats: 12, claims: {onOverSeats: []}}))).toBeNull()
  })

  test('when both call for a notice, the one more people see wins, then the expiry', () => {
    const both = status({now: new Date('2026-12-15'), activeSeats: 12})
    expect(getLicenseNotice(both)?.kind).toBe('EXPIRING')
    const seatsToEveryone = status({
      now: new Date('2026-12-15'),
      activeSeats: 12,
      claims: {onOverSeats: [{from: '0d', notice: 'everyone'}]}
    })
    expect(getLicenseNotice(seatsToEveryone)).toMatchObject({
      kind: 'OVER_SEATS',
      audience: 'everyone'
    })
  })

  test('tells admins when an instance that needs a license has none, and until when', () => {
    const notice = getLicenseNotice(
      status({
        parsed: {ok: false, reason: 'missing'},
        unlicensedSince: new Date('2026-06-01')
      })
    )
    expect(notice).toEqual({
      kind: 'MISSING',
      audience: 'admins',
      message:
        'This Parabol instance has no license. Organizations without a subscription keep their paid features until 2026-07-01. Contact Parabol for a license.',
      graceEndsAt: new Date('2026-07-01')
    })
  })

  test('says why a license is invalid', () => {
    const notice = getLicenseNotice(
      status({parsed: {ok: false, reason: 'invalid', error: 'the signature does not match'}})
    )
    expect(notice).toMatchObject({kind: 'INVALID', audience: 'admins'})
    expect(notice?.message).toContain('invalid: the signature does not match.')
  })
})

describe('getReadOnlyMessage', () => {
  test('says why a change was refused', () => {
    expect(getReadOnlyMessage(status({now: new Date('2027-07-01')}))).toBe(
      "This Parabol instance's license expired on 2027-01-01, so Parabol is read-only: nothing can be changed. Contact Parabol to renew it."
    )
    const seats = status({
      activeSeats: 12,
      claims: {onOverSeats: [{from: '0d', notice: 'none', action: 'read-only'}]}
    })
    expect(getReadOnlyMessage(seats)).toBe(
      'This Parabol instance has 12 active users and its license covers 10, so Parabol is read-only: nothing can be changed. Contact Parabol to add seats.'
    )
  })
})
