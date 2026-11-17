import ms from 'ms'
import {Logger} from '../utils/Logger'
import {licensePublicKeys} from './licensePublicKeys'
import {parsePrivateLicenseKey, usageReportLevelOf} from './licenseToken'

const instanceLicense = parsePrivateLicenseKey(
  process.env.PRIVATE_LICENSE_KEY,
  licensePublicKeys,
  process.env.HOST
)

/** How long a web server with a test license runs before it freezes, so it can't serve anyone for long */
export const TEST_LICENSE_LIFETIME_MS = ms('2h')

export const getInstanceLicense = () => instanceLicense.parsed

/** The private usage key that signs usage reports, and the license that goes in them, or why there's none */
export const getPrivateUsageKey = () => instanceLicense.usage

/** What usage reports carry, '' when the instance can't make them */
export const getUsageReportLevel = () => {
  const {parsed, usage} = instanceLicense
  return parsed.ok && usage.ok ? usageReportLevelOf(parsed.claims) : ''
}

// When a license that asks for read-only at expiry turns this instance read-only, worked out once. A cached flag says
// whether it has, and a timer flips it then, so a request reads a boolean and no more
const readOnlyAt = (() => {
  const {parsed} = instanceLicense
  if (!parsed.ok || parsed.claims.onExpiry !== 'read-only' || !parsed.claims.expiresAt) return null
  const at = Date.parse(parsed.claims.expiresAt)
  return Number.isNaN(at) ? null : at
})()
let readOnly = false
// setTimeout waits at most about 24.8 days, so a later expiry takes a few timers
const MAX_TIMEOUT_MS = 2 ** 31 - 1
const watchExpiry = () => {
  if (readOnlyAt === null) return
  const wait = readOnlyAt - Date.now()
  if (wait <= 0) {
    readOnly = true
    return
  }
  setTimeout(watchExpiry, Math.min(wait, MAX_TIMEOUT_MS)).unref()
}
watchExpiry()

/** Whether the license can ever turn this instance read-only */
export const canTurnReadOnly = () => readOnlyAt !== null

/** Whether the license has turned this instance read-only, as of its expiry */
export const isLicenseReadOnly = () => readOnly

const day = (iso: string) => iso.slice(0, 10)

// A test license's web server stops answering, /health included, so its pod restarts and it can't serve anyone for
// long. Busy, rather than exiting, so the restart waits for the liveness probe.
const freezeForever = () => {
  Logger.fatal(
    'This web server has a test license, and has run as long as one may. It stops responding now'
  )
  const until = Number.POSITIVE_INFINITY
  while (Date.now() < until) {
    // blocks the event loop for good
  }
}

/**
 * A production build exits without a valid license. Development builds and tests start without one, so anyone can
 * work on Parabol
 */
export const requireInstanceLicense = (now = new Date(), freeze = freezeForever) => {
  const {parsed, usage} = instanceLicense
  if (!parsed.ok) {
    const problem =
      parsed.reason === 'missing'
        ? 'PRIVATE_LICENSE_KEY is not set'
        : `PRIVATE_LICENSE_KEY is not a valid license: ${parsed.error}`
    if (!__PRODUCTION__) {
      Logger.warn(`${problem}. A production build won't start without a license`)
      return
    }
    Logger.fatal(`Parabol can't start: ${problem}. Contact love@parabol.co for a license`)
    process.exit(1)
    return
  }
  const {id, customer, expiresAt, seats, type} = parsed.claims
  const covers = seats === undefined ? 'any number of active users' : `${seats} active users`
  if (expiresAt && Date.parse(expiresAt) <= now.getTime()) {
    const readOnlyNote =
      readOnlyAt !== null && readOnlyAt <= now.getTime() ? ', so Parabol is read-only' : ''
    Logger.warn(`License ${id} for ${customer} expired on ${day(expiresAt)}${readOnlyNote}`)
  } else {
    const until = expiresAt ? `, until ${day(expiresAt)}` : ''
    Logger.log(`License ${id} for ${customer}: ${covers}${until}`)
  }
  if (parsed.claims.publicUsageKey && !usage.ok) {
    Logger.warn(`Usage reports are off: ${usage.error}`)
  }
  if (type === 'test') {
    Logger.warn(
      `License ${id} is a test license: this web server stops responding ${ms(TEST_LICENSE_LIFETIME_MS, {long: true})} after it starts`
    )
    setTimeout(freeze, TEST_LICENSE_LIFETIME_MS)
  }
}
