import {GraphQLError} from 'graphql'
import {Logger, makeLogRecord, stringifyLogRecord} from '../Logger'

const time = new Date('2026-10-27T00:00:00Z')

test('an unexpected error carries Error Reporting and Datadog fields plus its request context', () => {
  const error = new TypeError("Cannot read properties of undefined (reading 'id')")
  const record = makeLogRecord(
    'error',
    error,
    [{extras: {path: 'viewer.team'}}],
    {
      userId: 'user1',
      operationName: 'TeamQuery',
      operationKind: 'query',
      variables: {teamId: 'team1', password: 'hunter2'},
      trace: 'projects/parabol/traces/abc',
      spanId: 'def',
      traceSampled: true
    },
    time
  )
  expect(record).toMatchObject({
    time: '2026-10-27T00:00:00.000Z',
    severity: 'ERROR',
    status: 'error',
    message: "Cannot read properties of undefined (reading 'id')",
    service: 'web',
    userId: 'user1',
    usr: {id: 'user1'},
    operationName: 'TeamQuery',
    operationKind: 'query',
    variables: {teamId: 'team1', password: '******'},
    extras: {path: 'viewer.team'},
    'logging.googleapis.com/trace': 'projects/parabol/traces/abc',
    'logging.googleapis.com/spanId': 'def',
    'logging.googleapis.com/trace_sampled': true,
    stack_trace: error.stack,
    serviceContext: {service: 'web'},
    context: {user: 'user1'},
    error: {kind: 'TypeError', expected: false}
  })
  expect(record.error?.fingerprint).toMatch(/^[0-9a-f]{16}$/)
})

test('an expected GraphQLError logged as a warning is flagged and leaves out variables and Error Reporting fields', () => {
  const record = makeLogRecord('warn', new GraphQLError('Not authorized'), [], {
    variables: {teamId: 'team1'}
  })
  expect(record.severity).toBe('WARNING')
  expect(record.error).toMatchObject({kind: 'GraphQLError', expected: true})
  expect(record).not.toHaveProperty('variables')
  expect(record).not.toHaveProperty('stack_trace')
})

test('a message logged with an error keeps both', () => {
  const record = makeLogRecord('error', 'Permission rule threw on Query.viewer', [
    new Error('boom')
  ])
  expect(record.message).toBe('Permission rule threw on Query.viewer: boom')
})

test('log options become fields instead of being printed into the message', () => {
  const record = makeLogRecord('info', 'Synced %s teams', [
    3,
    {userId: 'user1', tags: {orgId: 'org1'}}
  ])
  expect(record.message).toBe('Synced 3 teams')
  expect(record.tags).toEqual({orgId: 'org1', userId: 'user1'})
})

test('a record too large for Cloud Logging drops variables and extras but keeps the rest', () => {
  const large = 'x'.repeat(300_000)
  const record = makeLogRecord('error', new Error('boom'), [{extras: {large}}], {
    variables: {large}
  })
  const written = JSON.parse(stringifyLogRecord(record))
  expect(written.message).toBe('boom')
  expect(written.error.message).toBe('boom')
  expect(written).not.toHaveProperty('variables')
  expect(written).not.toHaveProperty('extras')
  expect(written.omitted.variablesLength).toBeGreaterThan(300_000)
})

describe('in production', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    Reflect.set(globalThis, '__PRODUCTION__', true)
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    Reflect.set(globalThis, '__PRODUCTION__', false)
    errorSpy.mockRestore()
  })

  test('each error is written once, as one JSON line', () => {
    const error = new Error('boom')
    Logger.error(error)
    Logger.error('Logged again by an outer layer', error)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(JSON.parse(errorSpy.mock.calls[0][0])).toMatchObject({
      severity: 'ERROR',
      message: 'boom'
    })
  })

  test('a fatal log is written even when its error was already logged', () => {
    const error = new Error('boom')
    Logger.error(error)
    Logger.fatal('Uncaught exception', error)
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(JSON.parse(errorSpy.mock.calls[1][0])).toMatchObject({
      severity: 'CRITICAL',
      message: 'Uncaught exception: boom'
    })
  })
})
