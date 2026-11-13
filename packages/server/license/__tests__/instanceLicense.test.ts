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
  hosts: ['parabol.acme.mil'],
  issuedAt: '2026-11-01T00:00:00.000Z',
  expiresAt: '2027-11-01T00:00:00.000Z'
}
const now = new Date('2026-12-01T00:00:00.000Z')

const logger = {log: jest.fn(), warn: jest.fn(), fatal: jest.fn()}
let exit: jest.SpyInstance

const load = (env: {LICENSE_KEY?: string; HOST?: string}, isProduction: boolean) => {
  let mod: typeof import('../instanceLicense') | undefined
  jest.isolateModules(() => {
    for (const name of ['LICENSE_KEY', 'HOST'] as const) {
      if (env[name] === undefined) delete process.env[name]
      else process.env[name] = env[name]
    }
    Reflect.set(globalThis, '__PRODUCTION__', isProduction)
    jest.doMock('../licensePublicKeys', () => ({licensePublicKeys: publicKeys}))
    jest.doMock('../../utils/Logger', () => ({Logger: logger}))
    mod = require('../instanceLicense')
  })
  return mod!
}

beforeEach(() => {
  exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})
afterEach(() => {
  exit.mockRestore()
  Reflect.set(globalThis, '__PRODUCTION__', false)
})

const forged = signLicense(
  claims,
  generateKeyPairSync('ed25519').privateKey.export({type: 'pkcs8', format: 'pem'}).toString()
)

describe('requireInstanceLicense', () => {
  test('a production build starts with a valid license and can sign usage reports', () => {
    const usage = generateUsageKeyPair()
    const key = `${signLicense({...claims, usageKey: usage.publicKey}, privatePem)}.${usage.privateKey}`
    const instance = load({LICENSE_KEY: key, HOST: 'parabol.acme.mil'}, true)
    instance.requireInstanceLicense(now)
    expect(exit).not.toHaveBeenCalled()
    expect(logger.log).toHaveBeenCalledWith(
      'License lic_1 for Acme: any number of active users, until 2027-11-01'
    )
    expect(instance.getUsageKey().ok).toBe(true)
  })

  test.each([
    ['no license', {HOST: 'parabol.acme.mil'}, 'LICENSE_KEY is not set'],
    [
      'a license Parabol didn’t sign',
      {LICENSE_KEY: forged, HOST: 'parabol.acme.mil'},
      'LICENSE_KEY is not a valid license: the signature does not match'
    ],
    [
      'a license for another host',
      {LICENSE_KEY: signLicense(claims, privatePem), HOST: 'parabol.other.mil'},
      'LICENSE_KEY is not a valid license: it covers parabol.acme.mil, not parabol.other.mil'
    ]
  ])('a production build exits with %s', (_name, env, problem) => {
    load(env, true).requireInstanceLicense(now)
    expect(logger.fatal).toHaveBeenCalledWith(
      `Parabol can't start: ${problem}. Contact love@parabol.co for a license`
    )
    expect(exit).toHaveBeenCalledWith(1)
  })

  test('an expired license only warns, since nothing acts on expiry yet', () => {
    const key = signLicense({...claims, expiresAt: '2026-11-15T00:00:00.000Z'}, privatePem)
    load({LICENSE_KEY: key, HOST: 'parabol.acme.mil'}, true).requireInstanceLicense(now)
    expect(exit).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith('License lic_1 for Acme expired on 2026-11-15')
  })

  test('a development build starts without a license', () => {
    load({}, false).requireInstanceLicense(now)
    expect(exit).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith(
      "LICENSE_KEY is not set. A production build won't start without a license"
    )
  })
})
