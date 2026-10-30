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
  release: '15.11.0+abc1234',
  route: '/team/abc',
  count: 1,
  breadcrumbs: [
    {
      time: '2026-10-30T00:00:00.000Z',
      type: 'operation',
      message: 'query TeamQuery',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736'
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
    version: '15.11.0+abc1234',
    component: 'browser',
    userId: 'user1',
    sessionId: 'tab-1',
    trace_id: '4bf92f3577b34da6a3ce929d0e0e4736',
    'logging.googleapis.com/trace': '4bf92f3577b34da6a3ce929d0e0e4736',
    serviceContext: {service: 'parabol-client', version: '15.11.0+abc1234'},
    context: {user: 'user1'},
    error: {kind: 'TypeError', message: MESSAGE, expected: false},
    extras: {route: '/team/abc', eventId: report.eventId, count: 1}
  })
  expect(record.stack_trace).toBe(
    `TypeError: ${MESSAGE}\n    at toUpperCase (packages/client/components/TeamList.tsx:2:20)`
  )
  expect(record.extras.breadcrumbs).toEqual(report.breadcrumbs)
})

test('a browser warning stays out of Error Reporting', async () => {
  await logClientError({...report, level: 'warn'}, {ip: '203.0.113.7'}, BUILD_DIR)
  expect(warnSpy).toHaveBeenCalledTimes(1)
  const record = JSON.parse(warnSpy.mock.calls[0][0])
  expect(record).toMatchObject({severity: 'WARNING', service: 'parabol-client'})
  expect(record).not.toHaveProperty('stack_trace')
})
