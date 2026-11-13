import {generateKeyPairSync} from 'node:crypto'
import type {LicenseClaims} from '../licenseToken'
import {makeUsageKeys, signLicense} from './licenseFixtures'

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

const load = (env: {PRIVATE_LICENSE_KEY?: string; HOST?: string}, isProduction: boolean) => {
  let mod: typeof import('../instanceLicense') | undefined
  jest.isolateModules(() => {
    for (const name of ['PRIVATE_LICENSE_KEY', 'HOST'] as const) {
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
    const usage = makeUsageKeys()
    const license = signLicense({...claims, publicUsageKey: usage.publicUsageKey}, privatePem)
    const instance = load(
      {PRIVATE_LICENSE_KEY: `${license}.${usage.privateUsageKey}`, HOST: 'parabol.acme.mil'},
      true
    )
    instance.requireInstanceLicense(now)
    expect(exit).not.toHaveBeenCalled()
    expect(logger.log).toHaveBeenCalledWith(
      'License lic_1 for Acme: any number of active users, until 2027-11-01'
    )
    expect(instance.getPrivateUsageKey().ok).toBe(true)
  })

  test.each([
    ['no license', {HOST: 'parabol.acme.mil'}, 'PRIVATE_LICENSE_KEY is not set'],
    [
      'a license Parabol didn’t sign',
      {PRIVATE_LICENSE_KEY: forged, HOST: 'parabol.acme.mil'},
      'PRIVATE_LICENSE_KEY is not a valid license: the signature does not match'
    ],
    [
      'a license for another host',
      {PRIVATE_LICENSE_KEY: signLicense(claims, privatePem), HOST: 'parabol.other.mil'},
      'PRIVATE_LICENSE_KEY is not a valid license: it covers parabol.acme.mil, not parabol.other.mil'
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
    load({PRIVATE_LICENSE_KEY: key, HOST: 'parabol.acme.mil'}, true).requireInstanceLicense(now)
    expect(exit).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith('License lic_1 for Acme expired on 2026-11-15')
  })

  test('a test license freezes the web server two hours after it starts', () => {
    jest.useFakeTimers()
    const freeze = jest.fn()
    const key = signLicense({...claims, type: 'test'}, privatePem)
    load({PRIVATE_LICENSE_KEY: key, HOST: 'parabol.acme.mil'}, true).requireInstanceLicense(
      now,
      freeze
    )
    expect(logger.warn).toHaveBeenCalledWith(
      'License lic_1 is a test license: this web server stops responding 2 hours after it starts'
    )
    jest.advanceTimersByTime(2 * 60 * 60 * 1000 - 1)
    expect(freeze).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(freeze).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  test('an ordinary license never freezes', () => {
    jest.useFakeTimers()
    const freeze = jest.fn()
    load(
      {PRIVATE_LICENSE_KEY: signLicense(claims, privatePem), HOST: 'parabol.acme.mil'},
      true
    ).requireInstanceLicense(now, freeze)
    jest.advanceTimersByTime(30 * 24 * 60 * 60 * 1000)
    expect(freeze).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  test('a development build starts without a license', () => {
    load({}, false).requireInstanceLicense(now)
    expect(exit).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith(
      "PRIVATE_LICENSE_KEY is not set. A production build won't start without a license"
    )
  })
})

describe('isLicenseReadOnly', () => {
  const expired = {...claims, expiresAt: '2026-11-15T00:00:00.000Z'}
  test('is read-only once a license that asks for it has expired', () => {
    const key = signLicense({...expired, onExpiry: 'read-only'}, privatePem)
    const instance = load({PRIVATE_LICENSE_KEY: key, HOST: 'parabol.acme.mil'}, true)
    expect(instance.isLicenseReadOnly(new Date('2026-11-14T23:59:59.000Z'))).toBe(false)
    expect(instance.isLicenseReadOnly(new Date('2026-11-15T00:00:00.000Z'))).toBe(true)
  })

  test('an expired license that doesn’t ask for it, or no license, stays writable', () => {
    const key = signLicense(expired, privatePem)
    expect(
      load({PRIVATE_LICENSE_KEY: key, HOST: 'parabol.acme.mil'}, true).isLicenseReadOnly(now)
    ).toBe(false)
    expect(load({}, false).isLicenseReadOnly(now)).toBe(false)
  })
})

describe('getUsageReportLevel', () => {
  const withUsage = (usageReports?: string) => {
    const usage = makeUsageKeys()
    const license = signLicense(
      {
        ...claims,
        publicUsageKey: usage.publicUsageKey,
        ...(usageReports !== undefined && {usageReports})
      },
      privatePem
    )
    return load(
      {PRIVATE_LICENSE_KEY: `${license}.${usage.privateUsageKey}`, HOST: 'parabol.acme.mil'},
      true
    ).getUsageReportLevel()
  }
  test('follows the license’s usageReports, counting a level it doesn’t know as user-count', () => {
    expect(withUsage('user-count')).toBe('user-count')
    expect(withUsage('user-activity')).toBe('user-activity')
    expect(withUsage('user-everything')).toBe('user-count')
    expect(withUsage('')).toBe('')
    expect(withUsage()).toBe('')
  })
})
