#!/usr/bin/env node
// Checks a usage report a customer sent, and prints what it says. Parabol's own tool: customers never need it.
//
//   node scripts/verifyUsageReport.mjs parabol-usage-parabol.acme.com-2026-12-01.json
//
// A report is genuine when Parabol issued the license inside it, and the usage key that license names signed the
// report, so nothing in it changed after the instance made it. It needs only Parabol's public keys, in
// packages/server/license/licensePublicKeys.ts. Exits 1 when the report isn't genuine.
import {readFileSync} from 'node:fs'
import {isDeepStrictEqual} from 'node:util'

// Node warns that the server's .ts files don't say they're ES modules. They are
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(warning)
})
const {verifyUsageReport} = await import('../packages/server/license/licenseToken.ts')
const {licensePublicKeys} = await import('../packages/server/license/licensePublicKeys.ts')

const path = process.argv[2]
if (!path) {
  console.error('Usage: node scripts/verifyUsageReport.mjs <report file>')
  process.exit(1)
}
const text = readFileSync(path, 'utf8').trim()
// the file the app downloads is JSON with the signed report under `signed`; a bare signed report works too
let file
try {
  file = JSON.parse(text)
} catch {
  file = undefined
}
const signed = typeof file?.signed === 'string' ? file.signed : text
const result = verifyUsageReport(signed, licensePublicKeys)
if (!result.ok) {
  console.error(`Not genuine: ${result.error}`)
  process.exit(1)
}

const {report, license} = result
const day = (iso) => iso?.slice(0, 10)
console.log('Genuine: Parabol issued its license, and the usage key the license names signed it.')
console.log()
console.log(`Customer      ${license.customer}`)
console.log(`License       ${license.id}, issued ${day(license.issuedAt)}`)
console.log(`Expires       ${license.expiresAt ? day(license.expiresAt) : 'never'}`)
console.log(`Seats         ${license.seats ?? 'any number'}`)
console.log(`Host          ${report.host}`)
console.log(`Made          ${report.generatedAt}`)
console.log(`Active users  ${report.activeUsers}`)
console.log()
console.log('Organizations that depend on the license, with their active users now:')
for (const org of report.organizations) console.log(`  ${org.activeUsers}\t${org.name} (${org.id})`)
console.log()
console.log('Most users active on any day, by month (UTC):')
for (const [month, peak] of Object.entries(report.monthlyPeaks)) console.log(`  ${month}\t${peak}`)

// the readable copy is for the customer's eyes; say so if it doesn't match what was signed
const readable = file?.report
if (
  readable &&
  !(
    readable.activeUsers === report.activeUsers &&
    readable.generatedAt === report.generatedAt &&
    isDeepStrictEqual(readable.organizations, report.organizations) &&
    isDeepStrictEqual(readable.monthlyPeaks, report.monthlyPeaks)
  )
) {
  console.log()
  console.log(
    'The file’s readable copy differs from what was signed. The numbers above are the signed ones.'
  )
}
