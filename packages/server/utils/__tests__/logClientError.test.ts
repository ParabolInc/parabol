import path from 'node:path'
import logClientError from '../logClientError'
import type {ClientErrorReport} from '../parseClientErrorBatch'

const BUILD_DIR = path.join(__dirname, 'fixtures', 'clientBuild')
const BUNDLE_URL = 'https://action-files.parabol.co/production/build/app_0123abcd.js'
const MESSAGE = "Cannot read properties of undefined (reading 'toUpperCase')"

const report: ClientErrorReport = {
  level: 'error',
  name: 'TypeError',
  message: MESSAGE,
  stack: `TypeError: ${MESSAGE}\n    at e (${BUNDLE_URL}:1:29)`,
  eventId: '2f1c7a8e-5b3d-4c9a-8e6f-1a2b3c4d5e6f',
  traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
  sessionId: 'tab-1',
  release: '15.11.0',
  route: '/team/UZoObZMXvy',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  count: 1,
  breadcrumbs: [
    {
      time: '2026-10-30T00:00:00.000Z',
      type: 'operation',
      message: 'query TeamQuery',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736'
    },
    {time: '2026-10-30T00:00:01.000Z', type: 'navigation', message: '/meet/UZoObZMXvy/discuss/1'},
    {time: '2026-10-30T00:00:02.000Z', type: 'websocket', message: 'connected'},
    {
      time: '2026-10-30T00:00:03.000Z',
      type: 'error',
      message: 'Error: No base meeting object found in Relay UZoObZMXvy for jane@example.com'
    }
  ]
}

let errorSpy: jest.SpyInstance
let warnSpy: jest.SpyInstance
beforeEach(() => {
  Reflect.set(globalThis, '__PRODUCTION__', true)
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  Reflect.set(globalThis, '__PRODUCTION__', false)
  errorSpy.mockRestore()
  warnSpy.mockRestore()
})

test('a browser error is logged as parabol-client, joined to its trace, with the original source', async () => {
  await logClientError(report, {userId: 'user1', ip: '203.0.113.7'}, BUILD_DIR)
  expect(errorSpy).toHaveBeenCalledTimes(1)
  const record = JSON.parse(errorSpy.mock.calls[0][0])
  expect(record).toMatchObject({
    severity: 'ERROR',
    service: 'parabol-client',
    version: '15.11.0',
    component: 'browser',
    userId: 'user1',
    sessionId: 'tab-1',
    trace_id: '4bf92f3577b34da6a3ce929d0e0e4736',
    'logging.googleapis.com/trace': '4bf92f3577b34da6a3ce929d0e0e4736',
    serviceContext: {service: 'parabol-client', version: '15.11.0'},
    context: {user: 'user1'},
    error: {kind: 'TypeError', message: MESSAGE, expected: false},
    client: {
      route: '/team/:id',
      rawRoute: '/team/UZoObZMXvy',
      browser: 'Chrome 141',
      os: 'macOS',
      userAgent: report.userAgent,
      eventId: report.eventId,
      count: 1
    }
  })
  expect(record).not.toHaveProperty('extras')
  expect(record.stack_trace).toBe(
    `TypeError: ${MESSAGE}\n    at toUpperCase (packages/client/components/TeamList.tsx:2:20)`
  )
})

test('the breadcrumb trail keeps names and loses ids and free text', async () => {
  await logClientError(report, {userId: 'user1', ip: '203.0.113.7'}, BUILD_DIR)
  const record = JSON.parse(errorSpy.mock.calls[0][0])
  expect(record.client.breadcrumbs.map(({message}: {message: string}) => message)).toEqual([
    'query TeamQuery',
    '/meet/:id/discuss/1',
    'connected',
    'Error: No base meeting object found in Relay <id> for <email>'
  ])
})

test("a render error's component stack is mapped to source like its stack", async () => {
  await logClientError(
    {...report, componentStack: `\n    at e (${BUNDLE_URL}:1:29)\n    at div`},
    {userId: 'user1', ip: '203.0.113.7'},
    BUILD_DIR
  )
  const record = JSON.parse(errorSpy.mock.calls[0][0])
  expect(record.client.componentStack).toBe(
    '    at toUpperCase (packages/client/components/TeamList.tsx:2:20)'
  )
})

test('the causes React hides behind its own error are logged mapped to source, under the same fingerprint', async () => {
  await logClientError(report, {userId: 'user1', ip: '203.0.113.7'}, BUILD_DIR)
  const withoutCause = JSON.parse(errorSpy.mock.calls[0][0])
  await logClientError(
    {
      ...report,
      causes: [{name: 'RangeError', message: 'the real error', stack: report.stack}]
    },
    {userId: 'user1', ip: '203.0.113.7'},
    BUILD_DIR
  )
  const record = JSON.parse(errorSpy.mock.calls[1][0])
  expect(record.error.fingerprint).toBe(withoutCause.error.fingerprint)
  expect(record.error.cause).toEqual([
    {
      kind: 'RangeError',
      message: 'the real error',
      stack:
        'RangeError: the real error\n    at toUpperCase (packages/client/components/TeamList.tsx:2:20)'
    }
  ])
})

test('a browser warning stays out of Error Reporting', async () => {
  await logClientError({...report, level: 'warn'}, {ip: '203.0.113.7'}, BUILD_DIR)
  expect(warnSpy).toHaveBeenCalledTimes(1)
  const record = JSON.parse(warnSpy.mock.calls[0][0])
  expect(record).toMatchObject({severity: 'WARNING', service: 'parabol-client'})
  expect(record).not.toHaveProperty('stack_trace')
})

test("a crawler's browser error is only a warning", async () => {
  await logClientError(
    {
      ...report,
      name: 'Error',
      message: 'HTTP 403: Forbidden',
      stack: `Error: HTTP 403: Forbidden\n    at ${BUNDLE_URL}:1:29`,
      userAgent:
        'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/136.0.0.0 Safari/537.36'
    },
    {ip: '40.77.167.247'},
    BUILD_DIR
  )
  expect(errorSpy).not.toHaveBeenCalled()
  expect(warnSpy).toHaveBeenCalledTimes(1)
  expect(JSON.parse(warnSpy.mock.calls[0][0])).toMatchObject({
    severity: 'WARNING',
    service: 'parabol-client'
  })
})
