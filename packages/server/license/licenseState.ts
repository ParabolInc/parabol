import {sql} from 'kysely'
import ms from 'ms'
import getKysely from '../postgres/getKysely'
import {Logger} from '../utils/Logger'
import {getLicenseStatus, type LicenseStatus} from './getLicenseStatus'
import {licensePublicKeys} from './licensePublicKeys'
import {parseLicense} from './licenseToken'

/*
The instance's license status, kept in memory so tier checks stay synchronous. It's worked out from PARABOL_LICENSE
when the server starts, and refreshed hourly with what needs the database: whether any organization has a paid tier
without a Stripe subscription, when the instance was first found without the license it needs, and the active seats.
Until the first refresh, a missing license is in its grace period, so nothing is taken away while the server starts.
*/

const parsed = parseLicense(process.env.PARABOL_LICENSE, licensePublicKeys, process.env.HOST)
let status: LicenseStatus = getLicenseStatus({
  parsed,
  now: new Date(),
  unlicensedSince: null,
  needsLicense: false
})

export const getCurrentLicenseStatus = () => status

const countActiveSeats = async () => {
  const row = await getKysely()
    .selectFrom('OrganizationUser')
    .innerJoin('User', 'User.id', 'OrganizationUser.userId')
    .where('OrganizationUser.removedAt', 'is', null)
    .where('User.inactive', '=', false)
    .where('User.isRemoved', '=', false)
    .select(({fn}) => fn.count<string>('OrganizationUser.userId').distinct().as('count'))
    .executeTakeFirst()
  return Number(row?.count ?? 0)
}

const describe = (s: LicenseStatus) => {
  const who = s.claims ? `${s.claims.customer} (${s.claims.id}, ${s.claims.tier})` : undefined
  switch (s.state) {
    case 'valid':
      return `License for ${who} is valid`
    case 'expiring':
      return `License for ${who} expires on ${s.expiresAt?.toISOString()}`
    case 'expired':
      return `License for ${who} expired on ${s.expiresAt?.toISOString()}; paid features end on ${s.graceEndsAt?.toISOString()}`
    case 'missing':
      return `No license (PARABOL_LICENSE); paid features without a Stripe subscription end on ${s.graceEndsAt?.toISOString()}`
    case 'invalid':
      return `License is invalid: ${s.error}; paid features without a Stripe subscription end on ${s.graceEndsAt?.toISOString()}`
  }
}

const logChange = (prev: LicenseStatus | undefined, next: LicenseStatus) => {
  const changed =
    !prev ||
    prev.state !== next.state ||
    prev.maxTier !== next.maxTier ||
    prev.needsLicense !== next.needsLicense ||
    prev.overSeats !== next.overSeats
  if (!changed) return
  const quiet = next.state === 'valid' || (!next.needsLicense && next.state === 'missing')
  if (quiet) {
    Logger.log(describe(next))
  } else {
    Logger.warn(describe(next))
  }
  if (next.overSeats) {
    Logger.warn(
      `License covers ${next.claims?.seats} active users; this instance has ${next.activeSeats}`
    )
  }
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
    await pg
      .updateTable('InstanceLicense')
      .set({unlicensedSince: null, updatedAt: now})
      .where('id', '=', 'instance')
      .where('unlicensedSince', 'is not', null)
      .execute()
  } else if (needsLicense) {
    // the first server to find the instance unlicensed starts the clock; later ones keep it
    const row = await pg
      .insertInto('InstanceLicense')
      .values({id: 'instance', unlicensedSince: now, updatedAt: now})
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          unlicensedSince: sql`coalesce("InstanceLicense"."unlicensedSince", excluded."unlicensedSince")`,
          updatedAt: now
        })
      )
      .returning('unlicensedSince')
      .executeTakeFirst()
    unlicensedSince = row?.unlicensedSince ?? now
  }
  const activeSeats =
    parsed.ok && parsed.claims.seats !== undefined ? await countActiveSeats() : undefined
  const next = getLicenseStatus({parsed, now, unlicensedSince, needsLicense, activeSeats})
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
