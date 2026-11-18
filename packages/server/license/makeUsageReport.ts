import ms from 'ms'
import {getInstanceLicense, getPrivateUsageKey, getUsageReportLevel} from './instanceLicense'
import {
  countActiveUsers,
  countActiveUsersByOrg,
  readMonthlyPeaks,
  readTopFacilitators
} from './licensedUsers'
import {signUsageReport, type UsageReportClaims} from './licenseToken'

// how far back monthly peaks go, at most
const MAX_MONTHS = 12

const ABOUT =
  'A usage summary from a Parabol instance, to share with Parabol. `report` is there to read; `signed` is the same ' +
  'summary, signed with the instance’s private usage key.'
const ABOUT_FACILITATORS =
  ' It includes the names and emails of the people who ran the most meetings, for Parabol’s customer success team.'

/**
 * The instance's usage report, signed with its private usage key, as a JSON file: active users now, in each organization, and
 * each month's peak since the license was issued, for up to the last 12 months
 */
export const makeUsageReport = async (now = new Date()) => {
  const usage = getPrivateUsageKey()
  const license = getInstanceLicense()
  const level = getUsageReportLevel()
  if (!usage.ok || !license.ok || !level) {
    throw new Error(
      `This instance can't sign usage reports: ${usage.ok ? 'its license has no usage reports' : usage.error}`
    )
  }
  const {claims} = license
  const earliest = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MAX_MONTHS - 1), 1))
  const issuedAt = new Date(claims.issuedAt)
  const since = issuedAt > earliest ? issuedAt : earliest
  const [activeUsers, organizations, monthlyPeaks] = await Promise.all([
    countActiveUsers(),
    countActiveUsersByOrg(),
    readMonthlyPeaks(since)
  ])
  // a tenth of the active users, so a bigger instance names more of its champions
  const limit = Math.ceil(activeUsers / 10)
  const topFacilitators =
    level === 'user-activity'
      ? {
          limit,
          last90Days: await readTopFacilitators(new Date(now.getTime() - ms('90d')), limit),
          sinceLicenseIssued: await readTopFacilitators(issuedAt, limit)
        }
      : undefined
  const host = process.env.HOST ?? ''
  const report: UsageReportClaims = {
    v: 1,
    type: 'usage',
    license: usage.license,
    host,
    generatedAt: now.toISOString(),
    activeUsers,
    organizations,
    monthlyPeaks,
    ...(topFacilitators && {topFacilitators})
  }
  const file = {
    about: topFacilitators ? ABOUT + ABOUT_FACILITATORS : ABOUT,
    report: {
      customer: claims.customer,
      licenseId: claims.id,
      host,
      generatedAt: report.generatedAt,
      activeUsers,
      seats: claims.seats ?? null,
      organizations,
      monthlyPeaks,
      ...(topFacilitators && {topFacilitators})
    },
    signed: signUsageReport(report, usage.privateUsageKey)
  }
  const safeHost = host.replace(/[^a-zA-Z0-9.-]+/g, '-') || 'parabol'
  return {
    file: `${JSON.stringify(file, null, 2)}\n`,
    fileName: `parabol-usage-${safeHost}-${report.generatedAt.slice(0, 10)}.json`
  }
}
