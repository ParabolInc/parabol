import {generateKeyPairSync} from 'node:crypto'
import {generateUsageKeyPair, type LicenseClaims, signLicense} from '../licenseToken'

const {privateKey, publicKey} = generateKeyPairSync('ed25519')
const privatePem = privateKey.export({type: 'pkcs8', format: 'pem'}).toString()
const publicKeys = {test: publicKey.export({type: 'spki', format: 'pem'}).toString()}
const claims: LicenseClaims = {
  v: 1,
  kid: 'test',
  id: 'lic_1',
  customer: 'Acme',
  issuedAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2026-11-02T00:00:00.000Z',
  onExpiry: [],
  onOverSeats: []
}

const load = (env: {LICENSE_KEY?: string; IS_SINGLE_ORG?: string}) => {
  let mod: typeof import('../instanceLicense') | undefined
  jest.isolateModules(() => {
    for (const name of ['LICENSE_KEY', 'IS_SINGLE_ORG'] as const) {
      if (env[name] === undefined) delete process.env[name]
      else process.env[name] = env[name]
    }
    jest.doMock('../licensePublicKeys', () => ({licensePublicKeys: publicKeys}))
    mod = require('../instanceLicense')
  })
  return mod!
}

describe('instanceLicense', () => {
  test('a valid license, even an expired one, makes an enterprise instance', () => {
    const usage = generateUsageKeyPair()
    const key = `${signLicense({...claims, usageKey: usage.publicKey}, privatePem)}.${usage.privateKey}`
    const instance = load({LICENSE_KEY: key, IS_SINGLE_ORG: 'true'})
    expect(instance.isEnterpriseInstance()).toBe(true)
    expect(instance.isSingleOrgInstance()).toBe(true)
    expect(instance.getInstanceLicense().usage.ok).toBe(true)
  })

  test('Parabol’s cloud license doesn’t', () => {
    const instance = load({LICENSE_KEY: signLicense({...claims, saas: true}, privatePem)})
    expect(instance.isEnterpriseInstance()).toBe(false)
  })

  test('no license, or one Parabol didn’t sign, doesn’t either, and IS_SINGLE_ORG alone does nothing', () => {
    expect(load({IS_SINGLE_ORG: 'true'}).isSingleOrgInstance()).toBe(false)
    const forged = signLicense(
      claims,
      generateKeyPairSync('ed25519').privateKey.export({type: 'pkcs8', format: 'pem'}).toString()
    )
    expect(load({LICENSE_KEY: forged}).isEnterpriseInstance()).toBe(false)
  })
})
