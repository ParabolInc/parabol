import {generateKeyPairSync} from 'node:crypto'
import {isHostCovered, type LicenseClaims, parseLicense, signLicense} from '../licenseToken'

const makeKeys = () => {
  const {privateKey, publicKey} = generateKeyPairSync('ed25519')
  return {
    privatePem: privateKey.export({type: 'pkcs8', format: 'pem'}).toString(),
    publicPem: publicKey.export({type: 'spki', format: 'pem'}).toString()
  }
}

const keys = makeKeys()
const publicKeys = {test: keys.publicPem}
const claims: LicenseClaims = {
  v: 1,
  kid: 'test',
  id: 'lic_1',
  customer: 'Acme',
  tier: 'enterprise',
  seats: 50,
  hosts: ['parabol.acme.mil'],
  issuedAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2027-11-01T00:00:00.000Z'
}

describe('parseLicense', () => {
  test('accepts a license Parabol signed, on a host it covers', () => {
    const token = signLicense(claims, keys.privatePem)
    expect(parseLicense(token, publicKeys, 'parabol.acme.mil')).toEqual({ok: true, claims})
  })

  test('reports no license as missing', () => {
    expect(parseLicense(undefined, publicKeys, 'x')).toEqual({ok: false, reason: 'missing'})
    expect(parseLicense('  ', publicKeys, 'x')).toEqual({ok: false, reason: 'missing'})
  })

  test('rejects a license whose payload was changed', () => {
    const [payload, signature] = signLicense(claims, keys.privatePem).split('.')
    const changed = Buffer.from(
      JSON.stringify({...JSON.parse(Buffer.from(payload!, 'base64url').toString()), seats: 5000})
    ).toString('base64url')
    const result = parseLicense(`${changed}.${signature}`, publicKeys, 'parabol.acme.mil')
    expect(result).toMatchObject({
      ok: false,
      reason: 'invalid',
      error: 'the signature does not match'
    })
  })

  test('rejects a license signed with someone else’s key under Parabol’s key ID', () => {
    const forged = signLicense(claims, makeKeys().privatePem)
    expect(parseLicense(forged, publicKeys, 'parabol.acme.mil')).toMatchObject({
      ok: false,
      error: 'the signature does not match'
    })
  })

  test('rejects an unknown key ID and malformed tokens', () => {
    const unknownKid = signLicense({...claims, kid: 'other'}, keys.privatePem)
    expect(parseLicense(unknownKid, publicKeys, 'parabol.acme.mil')).toMatchObject({
      ok: false,
      error: 'unknown signing key other'
    })
    expect(parseLicense('not-a-license', publicKeys, 'x')).toMatchObject({
      ok: false,
      reason: 'invalid'
    })
    expect(parseLicense('a.b.c', publicKeys, 'x')).toMatchObject({ok: false, reason: 'invalid'})
  })

  test('rejects signed claims that make no sense', () => {
    const bad = signLicense({...claims, tier: 'platinum'} as any, keys.privatePem)
    expect(parseLicense(bad, publicKeys, 'parabol.acme.mil')).toMatchObject({
      ok: false,
      error: 'unknown tier platinum'
    })
    const noSeats = signLicense({...claims, seats: 0}, keys.privatePem)
    expect(parseLicense(noSeats, publicKeys, 'parabol.acme.mil')).toMatchObject({
      error: 'seats must be a positive integer'
    })
  })

  test('rejects a license for another host', () => {
    const token = signLicense(claims, keys.privatePem)
    expect(parseLicense(token, publicKeys, 'parabol.other.mil')).toMatchObject({
      ok: false,
      reason: 'invalid',
      error: 'it covers parabol.acme.mil, not parabol.other.mil'
    })
  })
})

describe('isHostCovered', () => {
  test('matches hostnames, ignoring case and port, with *. wildcards', () => {
    expect(isHostCovered(undefined, undefined)).toBe(true)
    expect(isHostCovered(['parabol.acme.mil'], 'Parabol.Acme.mil:443')).toBe(true)
    expect(isHostCovered(['*.acme.mil'], 'retro.acme.mil')).toBe(true)
    expect(isHostCovered(['*.acme.mil'], 'acme.mil')).toBe(false)
    expect(isHostCovered(['*.acme.mil'], 'evilacme.mil')).toBe(false)
    expect(isHostCovered(['parabol.acme.mil'], undefined)).toBe(false)
  })
})
