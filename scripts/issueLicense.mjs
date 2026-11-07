#!/usr/bin/env node
// Issues a Parabol license, or makes the key pair that signs them. Parabol's own tool: customers never need it.
//
//   node scripts/issueLicense.mjs --generate-key
//     prints a new Ed25519 key pair. Keep the private key secret; add the public key, under a new key ID, to
//     packages/server/license/licensePublicKeys.ts before signing with it.
//
//   node scripts/issueLicense.mjs --key private.pem --kid 2026-11 --customer "Acme" --tier enterprise \
//     [--seats 500] [--hosts parabol.acme.mil,*.acme.mil] [--expires 2027-11-30]
//     prints a license for PARABOL_LICENSE. Without --expires it never expires.
//
// The format is packages/server/license/licenseToken.ts's: base64url JSON, a dot, and the base64url Ed25519
// signature of that JSON's base64url text.
import {createPrivateKey, generateKeyPairSync, randomUUID, sign} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {parseArgs} from 'node:util'

const {values} = parseArgs({
  options: {
    'generate-key': {type: 'boolean'},
    key: {type: 'string'},
    kid: {type: 'string'},
    customer: {type: 'string'},
    tier: {type: 'string'},
    seats: {type: 'string'},
    hosts: {type: 'string'},
    expires: {type: 'string'}
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
if (!values.customer) fail('--customer is who the license is for')
if (values.tier !== 'team' && values.tier !== 'enterprise') fail('--tier is team or enterprise')
const seats = values.seats === undefined ? undefined : Number(values.seats)
if (seats !== undefined && !(Number.isInteger(seats) && seats > 0)) fail('--seats is a positive integer')
if (values.expires !== undefined && Number.isNaN(Date.parse(values.expires))) {
  fail('--expires is a date, such as 2027-11-30')
}

const claims = {
  v: 1,
  kid: values.kid,
  id: `lic_${randomUUID()}`,
  customer: values.customer,
  tier: values.tier,
  ...(seats !== undefined && {seats}),
  ...(values.hosts && {hosts: values.hosts.split(',').map((host) => host.trim())}),
  issuedAt: new Date().toISOString(),
  ...(values.expires && {expiresAt: new Date(values.expires).toISOString()})
}
const payload = Buffer.from(JSON.stringify(claims)).toString('base64url')
const signature = sign(null, Buffer.from(payload), createPrivateKey(readFileSync(values.key)))
console.error(JSON.stringify(claims, null, 2))
process.stdout.write(`${payload}.${signature.toString('base64url')}\n`)
