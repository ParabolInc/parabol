import {
  countActiveLicensedUsers,
  countActiveLicensedUsersByOrg,
  readMonthlyPeaks
} from './licensedUsers'
import {getCurrentLicenseStatus, getUsageKey} from './licenseState'
import {signUsageReport, type UsageReportClaims} from './licenseToken'

// how far back monthly peaks go, at most
const MAX_MONTHS = 24

const ABOUT =
  'A usage report from a Parabol instance, to send to Parabol. `report` is there to read. `signed` is what ' +
  'Parabol checks: the same report, signed with the instance’s usage key, which its license names.'

/**
 * The instance's usage report, signed with its usage key, as a JSON file: active users now, in each organization
 * that depends on the license, and each month's peak since the license was issued
 */
export const makeUsageReport = async (now = new Date()) => {
  const usage = getUsageKey()
  const {claims} = getCurrentLicenseStatus()
  if (!usage.ok || !claims) {
    throw new Error(
      `This instance can't sign usage reports: ${usage.ok ? 'no license' : usage.error}`
    )
  }
  const earliest = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MAX_MONTHS - 1), 1))
  const issuedAt = new Date(claims.issuedAt)
  const since = issuedAt > earliest ? issuedAt : earliest
  const [activeUsers, organizations, monthlyPeaks] = await Promise.all([
    countActiveLicensedUsers(),
    countActiveLicensedUsersByOrg(),
    readMonthlyPeaks(since)
  ])
  const host = process.env.HOST ?? ''
  const report: UsageReportClaims = {
    v: 1,
    type: 'usage',
    license: usage.license,
    host,
    generatedAt: now.toISOString(),
    activeUsers,
    organizations,
    monthlyPeaks
  }
  const file = {
    about: ABOUT,
    report: {
      customer: claims.customer,
      licenseId: claims.id,
      host,
      generatedAt: report.generatedAt,
      activeUsers,
      seats: claims.seats ?? null,
      organizations,
      monthlyPeaks
    },
    signed: signUsageReport(report, usage.privateKey)
  }
  const safeHost = host.replace(/[^a-zA-Z0-9.-]+/g, '-') || 'parabol'
  return {
    file: `${JSON.stringify(file, null, 2)}\n`,
    fileName: `parabol-usage-${safeHost}-${report.generatedAt.slice(0, 10)}.json`
  }
}
