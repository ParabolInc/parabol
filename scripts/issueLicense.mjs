#!/usr/bin/env node
// Issues a Parabol license key, or makes the key pair that signs them. Parabol's own tool: customers never need it.
//
//   node scripts/issueLicense.mjs --generate-key
//     prints a new Ed25519 key pair. Keep the private key secret; add the public key, under a new key ID, to
//     packages/server/license/licensePublicKeys.ts before signing with it.
//
//   node scripts/issueLicense.mjs --key private.pem --kid 2026-11 --claims acme.json
//     prints a license key for the instance's LICENSE_KEY, and the license's claims on stderr. A production build of
//     Parabol won't start without a valid one. The claims file says who it's for, as scripts/license.example.json does:
//       customer      who it's for
//       seats         how many active users it covers. Leave it out for any number
//       hosts         the hostnames (Parabol's HOST) it works on, *.example.com for any subdomain. Leave it out for any
//       expiresAt     a date, such as 2027-11-30. Leave it out for a license that never expires
//       usageReports  false for an instance whose admins mustn't see every organization on it, such as Parabol's cloud
//     Nothing acts on seats or expiresAt yet: they're there for usage reports and for later versions.
//     The claims file never has the usage key: the script makes a new one for each license, writes its public half
//     into the license as usageKey, and appends its private half to the license key it prints, for usage reports.
//     The script also adds the format's version, the key ID, a license ID and the issue date. Parabol keeps no copy of
//     the usage key's private half.
//
// The format is packages/server/license/licenseToken.ts's, which this script uses.
import {createPrivateKey, createPublicKey, generateKeyPairSync, randomUUID} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {parseArgs} from 'node:util'

// Node warns that the server's .ts files don't say they're ES modules. They are
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(warning)
})
const {checkClaims, generateUsageKeyPair, parseLicenseKey, signLicense} = await import(
  '../packages/server/license/licenseToken.ts'
)
const {licensePublicKeys} = await import('../packages/server/license/licensePublicKeys.ts')

const {values} = parseArgs({
  options: {
    'generate-key': {type: 'boolean'},
    key: {type: 'string'},
    kid: {type: 'string'},
    claims: {type: 'string'}
  }
})

if (values['generate-key']) {
  const {privateKey, publicKey} = generateKeyPairSync('ed25519')
  process.stdout.write(privateKey.export({type: 'pkcs8', format: 'pem'}).toString())
  process.stdout.write(publicKey.export({type: 'spki', format: 'pem'}).toString())
  process.exit(0)
}

const fail = (message) => {
  console.error(message)
  process.exit(1)
}
if (!values.key) fail('--key is the private key file')
if (!values.kid) fail('--kid is the key ID that licensePublicKeys.ts lists its public key under')
if (!values.claims) fail('--claims is the file that says who the license is for')

const privateKeyPem = readFileSync(values.key, 'utf8')
const publicKeyPem = createPublicKey(createPrivateKey(privateKeyPem)).export({
  type: 'spki',
  format: 'pem'
})
if (licensePublicKeys[values.kid]?.trim() !== publicKeyPem.toString().trim()) {
  fail(
    `licensePublicKeys.ts doesn't list this key's public half as ${values.kid}, so servers wouldn't trust it`
  )
}

const FIELDS = ['customer', 'seats', 'hosts', 'expiresAt', 'usageReports']
let input
try {
  input = JSON.parse(readFileSync(values.claims, 'utf8'))
} catch (error) {
  fail(`${values.claims} isn't JSON: ${error.message}`)
}
const unknown = Object.keys(input).filter((field) => !FIELDS.includes(field))
if (unknown.length > 0) fail(`${values.claims} has fields a license doesn't: ${unknown.join(', ')}`)
if (input.expiresAt !== undefined && Number.isNaN(Date.parse(input.expiresAt))) {
  fail('expiresAt is a date, such as 2027-11-30')
}

if (input.usageReports !== undefined && input.usageReports !== false) {
  fail('usageReports is false or left out')
}
const usage = input.usageReports === false ? undefined : generateUsageKeyPair()
const claims = {
  v: 1,
  kid: values.kid,
  id: `lic_${randomUUID()}`,
  customer: input.customer,
  ...(input.seats !== undefined && {seats: input.seats}),
  ...(input.hosts !== undefined && {hosts: input.hosts}),
  issuedAt: new Date().toISOString(),
  ...(input.expiresAt !== undefined && {expiresAt: new Date(input.expiresAt).toISOString()}),
  ...(usage && {usageKey: usage.publicKey})
}
const claimsError = checkClaims(claims)
if (claimsError) fail(`The license would be invalid: ${claimsError}`)

const license = signLicense(claims, privateKeyPem)
const licenseKey = usage ? `${license}.${usage.privateKey}` : license
// check it the way a server will
const {parsed, usage: usageCheck} = parseLicenseKey(
  licenseKey,
  licensePublicKeys,
  claims.hosts?.[0]
)
if (!parsed.ok || (usage && !usageCheck.ok)) {
  fail(`The license key doesn't check out: ${parsed.ok ? usageCheck.error : parsed.error}`)
}
console.error(JSON.stringify(claims, null, 2))
process.stdout.write(`${licenseKey}\n`)
