import {sql} from 'kysely'
import ms from 'ms'
import getKysely from '../postgres/getKysely'
import {Logger} from '../utils/Logger'
import {getLicenseStatus, type LicenseStatus, type LicenseTimeline} from './getLicenseStatus'
import {countActiveLicensedUsers} from './licensedUsers'
import {licensePublicKeys} from './licensePublicKeys'
import {parseLicenseKey} from './licenseToken'

/*
The instance's license status, kept in memory so tier checks stay synchronous. It's worked out from LICENSE_KEY
when the server starts, and refreshed hourly with what needs the database: whether any organization has a paid tier
without a Stripe subscription, when the instance was first found without the license it needs, the active users,
and since when more of them were active than the license covers.
Until the first refresh, a missing license is in its grace period, so nothing is taken away while the server starts.
*/

const {parsed, usage} = parseLicenseKey(
  process.env.LICENSE_KEY,
  licensePublicKeys,
  process.env.HOST
)
let status: LicenseStatus = getLicenseStatus({
  parsed,
  now: new Date(),
  unlicensedSince: null,
  needsLicense: false
})

export const getCurrentLicenseStatus = () => status

/** The usage key that signs usage reports, and the license that goes in them, or why there's none */
export const getUsageKey = () => usage

const day = (date: Date | undefined) => date?.toISOString().slice(0, 10)

const describeTimeline = (name: string, timeline: LicenseTimeline | undefined) => {
  if (!timeline) return undefined
  const {stage, nextDrop} = timeline
  const now = stage
    ? `${name} step from ${stage.from}: notice ${stage.notice}${stage.tier ? `, ${stage.tier}` : ''}`
    : `${name}: no step yet`
  return nextDrop ? `${now}; ${nextDrop.tier} from ${day(nextDrop.at)}` : now
}

const describe = (s: LicenseStatus) => {
  const who = s.claims ? `${s.claims.customer} (${s.claims.id}, ${s.claims.tier})` : undefined
  switch (s.state) {
    case 'valid':
    case 'expired': {
      const head =
        s.state === 'valid'
          ? `License for ${who} is valid${s.expiresAt ? ` until ${day(s.expiresAt)}` : ''}`
          : `License for ${who} expired on ${day(s.expiresAt)}`
      const seats = s.overSeats
        ? `${s.activeSeats} active users, over its ${s.claims?.seats} seats`
        : undefined
      return [
        head,
        describeTimeline('onExpiry', s.expiry),
        seats,
        describeTimeline('onOverSeats', s.overSeatsTimeline),
        `organizations without a Stripe subscription get ${s.maxTier ?? 'starter'}`
      ]
        .filter(Boolean)
        .join('; ')
    }
    case 'missing':
      return `No license (LICENSE_KEY); paid features without a Stripe subscription end on ${day(s.graceEndsAt)}`
    case 'invalid':
      return `License is invalid: ${s.error}; paid features without a Stripe subscription end on ${day(s.graceEndsAt)}`
  }
}

const logChange = (prev: LicenseStatus | undefined, next: LicenseStatus) => {
  const changed =
    !prev ||
    prev.state !== next.state ||
    prev.maxTier !== next.maxTier ||
    prev.needsLicense !== next.needsLicense ||
    prev.overSeats !== next.overSeats ||
    prev.expiry?.stage !== next.expiry?.stage ||
    prev.overSeatsTimeline?.stage !== next.overSeatsTimeline?.stage
  if (!changed) return
  const quiet =
    (next.state === 'valid' && !next.overSeats && !next.expiry?.stage) ||
    (!next.needsLicense && next.state === 'missing')
  if (quiet) {
    Logger.log(describe(next))
  } else {
    Logger.warn(describe(next))
  }
  if (!prev && parsed.ok && !usage.ok) {
    Logger.log(`Usage reports are off: ${usage.error}`)
  }
}

// One row, id 'instance', shared by every server. The first server to see a condition starts its clock
const startClock = async (column: 'unlicensedSince' | 'overSeatsSince', now: Date) => {
  const row = await getKysely()
    .insertInto('InstanceLicense')
    .values({id: 'instance', [column]: now, updatedAt: now})
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        [column]: sql`coalesce("InstanceLicense".${sql.ref(column)}, excluded.${sql.ref(column)})`,
        updatedAt: now
      })
    )
    .returning(column)
    .executeTakeFirst()
  return (row?.[column] as Date | null | undefined) ?? now
}

const stopClock = async (column: 'unlicensedSince' | 'overSeatsSince', now: Date) => {
  await getKysely()
    .updateTable('InstanceLicense')
    .set({[column]: null, updatedAt: now})
    .where('id', '=', 'instance')
    .where(column, 'is not', null)
    .execute()
}

let refreshed = false
export const refreshLicenseStatus = async () => {
  const pg = getKysely()
  const now = new Date()
  const paidWithoutStripe = await pg
    .selectFrom('Organization')
    .select('id')
    .where('tier', '!=', 'starter')
    .where('stripeSubscriptionId', 'is', null)
    .limit(1)
    .executeTakeFirst()
  const needsLicense = !!paidWithoutStripe
  let unlicensedSince: Date | null = null
  if (parsed.ok) {
    // a valid license stops the clock, so a later lapse starts a fresh grace period
    await stopClock('unlicensedSince', now)
  } else if (needsLicense) {
    unlicensedSince = await startClock('unlicensedSince', now)
  }
  let activeSeats: number | undefined
  let overSeatsSince: Date | null = null
  if (parsed.ok && parsed.claims.seats !== undefined) {
    activeSeats = await countActiveLicensedUsers()
    if (activeSeats > parsed.claims.seats) {
      overSeatsSince = await startClock('overSeatsSince', now)
    } else {
      // back within the seats, so going over again starts its timeline afresh
      await stopClock('overSeatsSince', now)
    }
  }
  const next = getLicenseStatus({
    parsed,
    now,
    unlicensedSince,
    needsLicense,
    activeSeats,
    overSeatsSince
  })
  logChange(refreshed ? status : undefined, next)
  refreshed = true
  status = next
  return status
}

let timer: NodeJS.Timeout | undefined
export const startLicenseMonitor = () => {
  if (timer) return
  const run = () => {
    refreshLicenseStatus().catch((error) => {
      Logger.error('License check failed', error)
    })
  }
  run()
  timer = setInterval(run, ms('1h'))
  timer.unref()
}
