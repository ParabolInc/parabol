jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))

import {fetch, Response} from '@whatwg-node/fetch'
import fetchRetryingTransientErrors from '../fetchRetryingTransientErrors'
import {Logger} from '../Logger'

const mockFetch = jest.mocked(fetch)
const REQUEST_URL = 'https://storage.test/upload'
const logLabel = 'upload of build/app.js'

const respondWith = (...results: Array<number | Error>) => {
  mockFetch.mockImplementation(async () => {
    const result = results.shift() ?? 200
    if (result instanceof Error) throw result
    return new Response(`body of ${result}`, {status: result})
  })
}

let warn: jest.SpyInstance

beforeEach(() => {
  mockFetch.mockReset()
  warn = jest.spyOn(Logger, 'warn').mockImplementation(() => {})
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

test('retries transient statuses and dropped connections until one succeeds', async () => {
  const socketError = Object.assign(new Error('socket hang up'), {code: 'ECONNRESET'})
  respondWith(503, socketError, 429, 200)
  const request = fetchRetryingTransientErrors(REQUEST_URL, {
    method: 'POST',
    body: 'code',
    logLabel
  })
  await jest.advanceTimersByTimeAsync(10_000)
  expect((await request).status).toBe(200)
  expect(mockFetch).toHaveBeenCalledTimes(4)
  expect(warn).toHaveBeenCalledTimes(3)
  expect(warn).toHaveBeenCalledWith(
    'upload of build/app.js failed with ECONNRESET on attempt 2 of 4, retrying'
  )
})

test('returns the last transient response after 4 attempts', async () => {
  respondWith(500, 500, 500, 500)
  const request = fetchRetryingTransientErrors(REQUEST_URL, {logLabel})
  await jest.advanceTimersByTimeAsync(10_000)
  const res = await request
  expect(res.status).toBe(500)
  expect(await res.text()).toBe('body of 500')
  expect(mockFetch).toHaveBeenCalledTimes(4)
})

test('returns a status that is not transient at once', async () => {
  respondWith(403)
  const res = await fetchRetryingTransientErrors(REQUEST_URL, {logLabel})
  expect(res.status).toBe(403)
  expect(mockFetch).toHaveBeenCalledTimes(1)
  expect(warn).not.toHaveBeenCalled()
})

test('throws an error that is not transient at once', async () => {
  respondWith(new Error('Unsupported protocol'))
  await expect(fetchRetryingTransientErrors(REQUEST_URL, {logLabel})).rejects.toThrow(
    'Unsupported protocol'
  )
  expect(mockFetch).toHaveBeenCalledTimes(1)
})
