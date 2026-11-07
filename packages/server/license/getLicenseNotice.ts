import type {LicenseStatus} from './getLicenseStatus'

export type LicenseNoticeKind = 'MISSING' | 'INVALID' | 'EXPIRING' | 'EXPIRED' | 'OVER_SEATS'

export interface LicenseNotice {
  kind: LicenseNoticeKind
  message: string
  graceEndsAt: Date | null
}

const day = (date: Date | undefined) => date?.toISOString().slice(0, 10)

/** What to tell admins about the license, most urgent first. null when there's nothing to say */
export const getLicenseNotice = (status: LicenseStatus): LicenseNotice | null => {
  const {state, maxTier, graceEndsAt, expiresAt, claims} = status
  if ((state === 'missing' || state === 'invalid') && status.needsLicense) {
    const what =
      state === 'missing'
        ? 'This Parabol instance has no license'
        : `This Parabol instance's license is invalid: ${status.error}`
    const consequence = maxTier
      ? `Organizations without a subscription keep their paid features until ${day(graceEndsAt)}.`
      : 'Organizations without a subscription have Starter features.'
    return {
      kind: state === 'missing' ? 'MISSING' : 'INVALID',
      message: `${what}. ${consequence} Contact Parabol for a license.`,
      graceEndsAt: graceEndsAt ?? null
    }
  }
  if (state === 'expired') {
    const consequence = maxTier
      ? `Organizations without a subscription keep their paid features until ${day(graceEndsAt)}.`
      : 'Organizations without a subscription have Starter features.'
    return {
      kind: 'EXPIRED',
      message: `This Parabol instance's license expired on ${day(expiresAt)}. ${consequence} Contact Parabol to renew it.`,
      graceEndsAt: graceEndsAt ?? null
    }
  }
  if (status.overSeats) {
    return {
      kind: 'OVER_SEATS',
      message: `This Parabol instance has ${status.activeSeats} active users; its license covers ${claims?.seats}. Contact Parabol to add seats.`,
      graceEndsAt: null
    }
  }
  if (state === 'expiring') {
    return {
      kind: 'EXPIRING',
      message: `This Parabol instance's license expires on ${day(expiresAt)}. Contact Parabol to renew it.`,
      graceEndsAt: null
    }
  }
  return null
}
