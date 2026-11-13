import {Logger} from '../utils/Logger'
import {licensePublicKeys} from './licensePublicKeys'
import {parsePrivateLicenseKey} from './licenseToken'

const instanceLicense = parsePrivateLicenseKey(
  process.env.PRIVATE_LICENSE_KEY,
  licensePublicKeys,
  process.env.HOST
)

export const getInstanceLicense = () => instanceLicense.parsed

/** The private usage key that signs usage reports, and the license that goes in them, or why there's none */
export const getPrivateUsageKey = () => instanceLicense.usage

const day = (iso: string) => iso.slice(0, 10)

/**
 * A production build exits without a valid license. Development builds and tests start without one, so anyone can
 * work on Parabol
 */
export const requireInstanceLicense = (now = new Date()) => {
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
  const {id, customer, expiresAt, seats} = parsed.claims
  const covers = seats === undefined ? 'any number of active users' : `${seats} active users`
  if (expiresAt && Date.parse(expiresAt) <= now.getTime()) {
    Logger.warn(`License ${id} for ${customer} expired on ${day(expiresAt)}`)
  } else {
    const until = expiresAt ? `, until ${day(expiresAt)}` : ''
    Logger.log(`License ${id} for ${customer}: ${covers}${until}`)
  }
  if (parsed.claims.publicUsageKey && !usage.ok) {
    Logger.warn(`Usage reports are off: ${usage.error}`)
  }
}
