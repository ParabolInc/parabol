import type {LicenseStatus, LicenseTimeline} from './getLicenseStatus'
import type {LicenseNoticeAudience} from './licenseToken'

export type LicenseNoticeKind = 'MISSING' | 'INVALID' | 'EXPIRING' | 'EXPIRED' | 'OVER_SEATS'

export interface LicenseNotice {
  kind: LicenseNoticeKind
  message: string
  /** Who sees it, of the organizations that depend on the license: their admins or all their members */
  audience: Exclude<LicenseNoticeAudience, 'none'>
  /** When organizations without a Stripe subscription lose paid features, if they will */
  graceEndsAt: Date | null
}

const day = (date: Date | undefined) => date?.toISOString().slice(0, 10)
const TIER_NAMES = {team: 'Team', starter: 'Starter'} as const

const consequenceOf = ({stage, nextDrop}: LicenseTimeline) => {
  const now = stage?.tier
    ? `Organizations without a subscription have ${TIER_NAMES[stage.tier]} features.`
    : undefined
  const next = nextDrop
    ? `From ${day(nextDrop.at)}, organizations without a subscription will have ${TIER_NAMES[nextDrop.tier]} features.`
    : undefined
  return [now, next].filter(Boolean).join(' ')
}

const sentences = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ')

/**
 * What to tell people about the license, or null when there's nothing to say. When both the expiry and the seats
 * call for a notice, it's the one more people see, and the expiry when that's a tie.
 */
export const getLicenseNotice = (status: LicenseStatus): LicenseNotice | null => {
  const {state, maxTier, graceEndsAt, expiresAt, claims, expiry, overSeatsTimeline} = status
  // with no organization depending on the license, it doesn't matter
  if (!status.needsLicense) return null
  if (state === 'missing' || state === 'invalid') {
    const what =
      state === 'missing'
        ? 'This Parabol instance has no license.'
        : `This Parabol instance's license is invalid: ${status.error}.`
    const consequence = maxTier
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
    const expired = state === 'expired'
    notices.push({
      kind: expired ? 'EXPIRED' : 'EXPIRING',
      message: sentences(
        expired
          ? `This Parabol instance's license expired on ${day(expiresAt)}.`
          : `This Parabol instance's license expires on ${day(expiresAt)}.`,
        consequenceOf(expiry),
        'Contact Parabol to renew it.'
      ),
      audience: expiryNotice,
      graceEndsAt: expiry.nextDrop?.at ?? null
    })
  }
  const seatsNotice = overSeatsTimeline?.stage?.notice
  if (overSeatsTimeline && seatsNotice && seatsNotice !== 'none') {
    notices.push({
      kind: 'OVER_SEATS',
      message: sentences(
        `This Parabol instance has ${status.activeSeats} active users; its license covers ${claims?.seats}.`,
        consequenceOf(overSeatsTimeline),
        'Contact Parabol to add seats.'
      ),
      audience: seatsNotice,
      graceEndsAt: overSeatsTimeline.nextDrop?.at ?? null
    })
  }
  return notices.find(({audience}) => audience === 'everyone') ?? notices[0] ?? null
}
