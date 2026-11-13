jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))

import {fetch, Response} from '@whatwg-node/fetch'
import {generateKeyPairSync} from 'crypto'
import {Logger} from '../../utils/Logger'
import GCSManager from '../GCSManager'

const mockFetch = jest.mocked(fetch)
const TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const {privateKey} = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {type: 'spki', format: 'pem'},
  privateKeyEncoding: {type: 'pkcs8', format: 'pem'}
})
const originalEnv = process.env

const respondToUploadsWith = (...uploadResults: Array<number | Error>) => {
  mockFetch.mockImplementation(async (url) => {
    if (String(url) === TOKEN_URL) return new Response(JSON.stringify({access_token: 'token'}))
    const result = uploadResults.shift() ?? 200
    if (result instanceof Error) throw result
    return new Response(`body of ${result}`, {status: result})
  })
}

const getUploadCount = () =>
  mockFetch.mock.calls.filter(([url]) => String(url) !== TOKEN_URL).length

let manager: GCSManager
let warn: jest.SpyInstance

beforeEach(() => {
  process.env = {
    ...originalEnv,
    CDN_BASE_URL: 'https://cdn.test/assets-bucket/production',
    GOOGLE_GCS_BUCKET: 'assets-bucket',
    GOOGLE_CLOUD_CLIENT_EMAIL: 'uploader@test.iam.gserviceaccount.com',
    GOOGLE_CLOUD_PRIVATE_KEY_ID: 'key-id',
    GOOGLE_CLOUD_PRIVATE_KEY: privateKey
  }
  manager = new GCSManager()
  warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {})
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
  process.env = originalEnv
})

test('an upload retries transient GCS errors until one succeeds', async () => {
  const socketError = Object.assign(new Error('socket hang up'), {code: 'ECONNRESET'})
  respondToUploadsWith(503, socketError, 429, 200)
  const upload = manager.putBuildFile(Buffer.from('code'), 'app.js')
  await jest.advanceTimersByTimeAsync(10_000)
  await expect(upload).resolves.toBe('https://cdn.test/assets-bucket/production/build/app.js')
  expect(getUploadCount()).toBe(4)
  expect(warn).toHaveBeenCalledTimes(3)
  expect(warn).toHaveBeenCalledWith(
    'GCS upload of production/build/app.js failed with ECONNRESET on attempt 2 of 4, retrying'
  )
})

test('an upload gives up after 4 attempts with the last status and body', async () => {
  respondToUploadsWith(500, 500, 500, 500)
  const upload = manager.putBuildFile(Buffer.from('code'), 'app.js')
  const assertion = expect(upload).rejects.toThrow(
    'GCS Upload Error: 500 body of 500. production/build/app.js'
  )
  await jest.advanceTimersByTimeAsync(10_000)
  await assertion
  expect(getUploadCount()).toBe(4)
})

test('an upload throws at once on a status that is not transient', async () => {
  respondToUploadsWith(403)
  await expect(manager.putBuildFile(Buffer.from('code'), 'app.js')).rejects.toThrow(
    'GCS Upload Error: 403 body of 403. production/build/app.js'
  )
  expect(getUploadCount()).toBe(1)
  expect(warn).not.toHaveBeenCalled()
})
