import type {LicenseStatus, LicenseTimeline} from './getLicenseStatus'
import type {LicenseNoticeAudience} from './licenseToken'

export type LicenseNoticeKind = 'MISSING' | 'INVALID' | 'EXPIRING' | 'EXPIRED' | 'OVER_SEATS'

export interface LicenseNotice {
  kind: LicenseNoticeKind
  message: string
  /** Who sees it, of the organizations that depend on the license: their admins or all their members */
  audience: Exclude<LicenseNoticeAudience, 'none'>
  /** When organizations without a Stripe subscription lose paid features or the instance turns read-only, if it will */
  graceEndsAt: Date | null
}

const day = (date: Date | undefined) => date?.toISOString().slice(0, 10)

const consequenceOf = ({stage, nextAction}: LicenseTimeline) => {
  const now =
    stage?.action === 'read-only'
      ? 'Parabol is read-only: everyone can see their work, but nothing can be changed.'
      : undefined
  const next =
    nextAction?.action === 'read-only'
      ? `From ${day(nextAction.at)}, Parabol will be read-only.`
      : undefined
  return [now, next].filter(Boolean).join(' ')
}

const sentences = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ')

const expiryLine = ({state, expiresAt}: LicenseStatus) =>
  state === 'expired'
    ? `This Parabol instance's license expired on ${day(expiresAt)}.`
    : `This Parabol instance's license expires on ${day(expiresAt)}.`

const seatsLine = ({activeSeats, claims}: LicenseStatus) =>
  `This Parabol instance has ${activeSeats} active users; its license covers ${claims?.seats}.`

/**
 * What to tell people about the license, or null when there's nothing to say. When both the expiry and the seats
 * call for a notice, it's the one more people see, and the expiry when that's a tie.
 */
export const getLicenseNotice = (status: LicenseStatus): LicenseNotice | null => {
  const {state, paidTiersAllowed, graceEndsAt, expiry, overSeatsTimeline} = status
  // with no organization depending on the license, it doesn't matter
  if (!status.needsLicense) return null
  if (state === 'missing' || state === 'invalid') {
    const what =
      state === 'missing'
        ? 'This Parabol instance has no license.'
        : `This Parabol instance's license is invalid: ${status.error}.`
    const consequence = paidTiersAllowed
      ? `Organizations without a subscription keep their paid features until ${day(graceEndsAt)}.`
      : 'Organizations without a subscription have Starter features.'
    return {
      kind: state === 'missing' ? 'MISSING' : 'INVALID',
      message: sentences(what, consequence, 'Contact Parabol for a license.'),
      audience: 'admins',
      graceEndsAt: graceEndsAt ?? null
    }
  }
  const notices: LicenseNotice[] = []
  const expiryNotice = expiry?.stage?.notice
  if (expiry && expiryNotice && expiryNotice !== 'none') {
    notices.push({
      kind: state === 'expired' ? 'EXPIRED' : 'EXPIRING',
      message: sentences(expiryLine(status), consequenceOf(expiry), 'Contact Parabol to renew it.'),
      audience: expiryNotice,
      graceEndsAt: expiry.nextAction?.at ?? null
    })
  }
  const seatsNotice = overSeatsTimeline?.stage?.notice
  if (overSeatsTimeline && seatsNotice && seatsNotice !== 'none') {
    notices.push({
      kind: 'OVER_SEATS',
      message: sentences(
        seatsLine(status),
        consequenceOf(overSeatsTimeline),
        'Contact Parabol to add seats.'
      ),
      audience: seatsNotice,
      graceEndsAt: overSeatsTimeline.nextAction?.at ?? null
    })
  }
  return notices.find(({audience}) => audience === 'everyone') ?? notices[0] ?? null
}

/** Why a change was refused, while the instance is read-only. Everyone who tries one sees it, whatever the notice */
export const getReadOnlyMessage = (status: LicenseStatus) => {
  const read = 'so Parabol is read-only: nothing can be changed.'
  if (status.expiry?.stage?.action === 'read-only') {
    return `This Parabol instance's license expired on ${day(status.expiresAt)}, ${read} Contact Parabol to renew it.`
  }
  return `This Parabol instance has ${status.activeSeats} active users and its license covers ${status.claims?.seats}, ${read} Contact Parabol to add seats.`
}
