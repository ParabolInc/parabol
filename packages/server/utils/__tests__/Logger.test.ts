import {GraphQLError} from 'graphql'
import {setFailedTraceKeeper} from '../../tracing/failedTraces'
import {Logger, makeLogRecord, setAccountLogContextLoader, stringifyLogRecord} from '../Logger'
import {runWithLogContext} from '../requestLogContext'
import {ThirdPartyResponseError} from '../ThirdPartyResponseError'

const time = new Date('2026-10-27T00:00:00Z')
const traceContext = {
  traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
  spanId: '00f067aa0ba902b7',
  traceSampled: true
}

// LOG_FORMAT is read when the module loads, so each format needs a fresh copy
const loadLogger = (logFormat?: string) => {
  jest.resetModules()
  if (logFormat === undefined) {
    delete process.env.LOG_FORMAT
  } else {
    process.env.LOG_FORMAT = logFormat
  }
  return require('../Logger') as typeof import('../Logger')
}

afterAll(() => {
  delete process.env.LOG_FORMAT
})

test('an unexpected error carries Error Reporting fields plus its request context', () => {
  const error = new TypeError("Cannot read properties of undefined (reading 'id')")
  const record = makeLogRecord(
    'error',
    error,
    [{graphql: {path: 'viewer.team', field: 'User.team'}}],
    {
      userId: 'user1',
      operationName: 'TeamQuery',
      operationKind: 'query',
      variables: {teamId: 'team1', password: 'hunter2'},
      ...traceContext
    },
    time
  )
  expect(record).toMatchObject({
    time: '2026-10-27T00:00:00.000Z',
    severity: 'ERROR',
    message: "Cannot read properties of undefined (reading 'id')",
    service: 'web',
    userId: 'user1',
    operationName: 'TeamQuery',
    operationKind: 'query',
    variables: {teamId: 'team1', password: '******'},
    graphql: {path: 'viewer.team', field: 'User.team'},
    trace_id: '4bf92f3577b34da6a3ce929d0e0e4736',
    span_id: '00f067aa0ba902b7',
    trace_flags: '01',
    'logging.googleapis.com/trace': '4bf92f3577b34da6a3ce929d0e0e4736',
    'logging.googleapis.com/spanId': '00f067aa0ba902b7',
    'logging.googleapis.com/trace_sampled': true,
    stack_trace: error.stack,
    serviceContext: {service: 'web'},
    context: {user: 'user1'},
    error: {kind: 'TypeError', expected: false}
  })
  expect(record.error?.fingerprint).toMatch(/^[0-9a-f]{16}$/)
})

test('outside GCP, a record keeps the OpenTelemetry trace fields and leaves out the Google ones', () => {
  const record = loadLogger('otel').makeLogRecord('error', new Error('boom'), [], {
    userId: 'user1',
    ...traceContext
  })
  expect(record).toMatchObject({
    trace_id: '4bf92f3577b34da6a3ce929d0e0e4736',
    span_id: '00f067aa0ba902b7',
    trace_flags: '01',
    error: {kind: 'Error', message: 'boom'}
  })
  expect(Object.keys(record).filter((key) => key.startsWith('logging.googleapis.com/'))).toEqual([])
  expect(record).not.toHaveProperty('stack_trace')
  expect(record).not.toHaveProperty('serviceContext')
  expect(record).not.toHaveProperty('context')
})

test('an unknown LOG_FORMAT fails at startup', () => {
  expect(() => loadLogger('datadog')).toThrow('Invalid LOG_FORMAT: datadog')
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

test('an error on an HTTP route carries its route, status, masked query and masked body', () => {
  const record = makeLogRecord('error', new Error('User exists'), [], {
    orgId: 'org1',
    http: {
      method: 'POST',
      route: '/scim/Users',
      path: '/scim/Users',
      query: 'filter=userName%20eq%20%22a%22&access_token=abc',
      contentType: 'application/scim+json',
      body: Buffer.from(JSON.stringify({userName: 'jane', password: 'hunter2'})),
      getStatus: () => 409
    }
  })
  expect(record).toMatchObject({
    orgId: 'org1',
    http: {
      method: 'POST',
      route: '/scim/Users',
      path: '/scim/Users',
      status: 409,
      query: {filter: 'userName eq "a"', access_token: '******'},
      body: {userName: 'jane', password: '******'}
    }
  })
})

test('a warning on an HTTP route leaves out the request', () => {
  const record = makeLogRecord('warn', 'Slow webhook', [], {
    http: {method: 'POST', route: '/stripe', path: '/stripe'}
  })
  expect(record).not.toHaveProperty('http')
})

test('an error lists its causes, outermost first, and describes a cause that is not an Error', () => {
  const rootCause = {code: 'ECONNRESET', password: 'hunter2'}
  const middle = Object.assign(new TypeError('fetch failed', {cause: rootCause}), {
    code: 'ECONNRESET'
  })
  const error = new Error('Could not load the issue', {cause: middle})
  const record = makeLogRecord('error', error, [])
  expect(record.error?.cause).toEqual([
    {kind: 'TypeError', message: 'fetch failed', code: 'ECONNRESET', stack: middle.stack},
    {kind: 'object', message: "{ code: 'ECONNRESET', password: '******' }"}
  ])
})

test('a cause that points back at its error ends the chain', () => {
  const error = new Error('outer')
  const inner = new Error('inner', {cause: error})
  error.cause = inner
  expect(makeLogRecord('error', error, []).error?.cause).toEqual([
    expect.objectContaining({kind: 'Error', message: 'inner'})
  ])
})

test('a third-party failure carries what the service answered', () => {
  const response = {
    integration: 'jira',
    method: 'GET',
    endpoint: 'api.atlassian.com/ex/jira/:id/rest/api/3/issue/:id',
    path: '/ex/jira/0e0e0e0e-0000-4000-8000-000000000000/rest/api/3/issue/PROJ-12',
    status: 503,
    contentType: 'text/html',
    body: '<html>Service Unavailable</html>'
  }
  const error = new ThirdPartyResponseError('Received non-JSON Atlassian Response', response)
  const record = makeLogRecord('error', error, [])
  expect(record.error).toMatchObject({kind: 'Error', response})
  const wrapped = makeLogRecord('error', new Error('Sync failed', {cause: error}), [])
  expect(wrapped.error?.cause?.[0]).toMatchObject({response})
})

test('a record shows which client and server versions met', () => {
  expect(makeLogRecord('error', new Error('boom'), [], {clientVersion: '15.11.0'})).toMatchObject({
    clientVersion: '15.11.0'
  })
  expect(
    makeLogRecord('error', new Error('boom'), [], {
      service: 'parabol-client',
      version: '15.11.0',
      serverVersion: '15.12.0'
    })
  ).toMatchObject({version: '15.11.0', serverVersion: '15.12.0'})
})

test('a record too large for Cloud Logging also drops the request body, breadcrumbs and cause stacks', () => {
  const large = 'x'.repeat(130_000)
  const error = new Error('boom', {cause: Object.assign(new Error('inner'), {stack: large})})
  const record = makeLogRecord(
    'error',
    error,
    [{client: {route: '/meet/:id', breadcrumbs: [large], componentStack: large}}],
    {
      http: {
        method: 'POST',
        route: '/zoom',
        path: '/zoom',
        body: Buffer.from(JSON.stringify({large}))
      }
    }
  )
  const written = JSON.parse(stringifyLogRecord(record))
  expect(written.http).toEqual({method: 'POST', route: '/zoom', path: '/zoom'})
  expect(written.client).toEqual({route: '/meet/:id'})
  expect(written.error.cause).toEqual([{kind: 'Error', message: 'inner'}])
  expect(written.omitted).toMatchObject({
    httpBodyLength: expect.any(Number),
    breadcrumbsLength: expect.any(Number),
    componentStackLength: expect.any(Number),
    causeStacksLength: expect.any(Number)
  })
  expect(JSON.stringify(written).length).toBeLessThan(250_000)
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
    setAccountLogContextLoader(undefined)
    setFailedTraceKeeper(undefined)
  })

  const readWrittenRecord = async (callIndex = 0) => {
    await new Promise(setImmediate)
    return JSON.parse(errorSpy.mock.calls[callIndex][0])
  }

  test("an error is written with its user's tier and feature flags", async () => {
    const account = {
      tier: 'team',
      featureFlags: [],
      orgs: [{id: 'org1', tier: 'team', featureFlags: ['Reports']}]
    }
    const loadAccount = jest.fn(async () => account)
    setAccountLogContextLoader(loadAccount)
    runWithLogContext({userId: 'user1'}, () => Logger.error(new Error('boom')))
    expect(await readWrittenRecord()).toMatchObject({userId: 'user1', account})
    expect(loadAccount).toHaveBeenCalledWith({userId: 'user1', orgId: undefined})
  })

  test('a tenant request with no user looks up its org', async () => {
    const loadAccount = jest.fn(async () => ({tier: 'enterprise', featureFlags: [], orgs: []}))
    setAccountLogContextLoader(loadAccount)
    runWithLogContext({orgId: 'org1'}, () => Logger.error(new Error('User exists')))
    expect(await readWrittenRecord()).toMatchObject({orgId: 'org1', account: {tier: 'enterprise'}})
    expect(loadAccount).toHaveBeenCalledWith({userId: undefined, orgId: 'org1'})
  })

  test('a failed account lookup still writes the error', async () => {
    setAccountLogContextLoader(async () => {
      throw new Error('database down')
    })
    runWithLogContext({userId: 'user1'}, () => Logger.error(new Error('boom')))
    const record = await readWrittenRecord()
    expect(record.message).toBe('boom')
    expect(record).not.toHaveProperty('account')
  })

  test('a fatal error is written at once, without waiting for the account', () => {
    const loadAccount = jest.fn(async () => ({tier: 'team'}))
    setAccountLogContextLoader(loadAccount)
    runWithLogContext({userId: 'user1'}, () =>
      Logger.fatal('Uncaught exception', new Error('boom'))
    )
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(loadAccount).not.toHaveBeenCalled()
  })

  test('an error in an unsampled trace keeps that trace for export and says so', async () => {
    const keepTrace = jest.fn(() => true)
    setFailedTraceKeeper(keepTrace)
    runWithLogContext({...traceContext, traceSampled: false}, () => {
      Logger.error(new Error('boom'))
    })
    expect(keepTrace).toHaveBeenCalledWith(traceContext.traceId)
    expect(await readWrittenRecord()).toMatchObject({
      trace_flags: '01',
      'logging.googleapis.com/trace_sampled': true
    })
  })

  test('a warning does not keep its trace', () => {
    const keepTrace = jest.fn(() => true)
    setFailedTraceKeeper(keepTrace)
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    runWithLogContext({...traceContext, traceSampled: false}, () => Logger.warn('slow'))
    expect(keepTrace).not.toHaveBeenCalled()
    warnSpy.mockRestore()
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
