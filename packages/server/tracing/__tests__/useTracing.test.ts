import {context, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {
  InMemorySpanExporter,
  type ReadableSpan,
  SimpleSpanProcessor,
  TracerProvider
} from '@opentelemetry/sdk-trace'
import {GraphQLError} from 'graphql'
import {createSchema, createYoga} from 'graphql-yoga'
import {CompiledQuery} from 'kysely'
import {Logger} from '../../utils/Logger'
import {getLogContext} from '../../utils/requestLogContext'
import {useErrorLogging} from '../../utils/useErrorLogging'
import traceKyselyQuery from '../traceKyselyQuery'
import {useTracing} from '../useTracing'

jest.mock('../initTracing', () => ({TRACING_ENABLED: true}))

const exporter = new InMemorySpanExporter()
trace.setGlobalTracerProvider(
  new TracerProvider({spanProcessors: [new SimpleSpanProcessor({exporter})]})
)
context.setGlobalContextManager(new AsyncLocalStorageContextManager())

const CLIENT_TRACE_ID = '4bf92f3577b34da6a3ce929d0e0e4736'
const CLIENT_SPAN_ID = '00f067aa0ba902b7'
const SAMPLED_TRACEPARENT = `00-${CLIENT_TRACE_ID}-${CLIENT_SPAN_ID}-01`

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `
      type Query { team: Team, crash: String, denied: String, logContext: String, warn: String }
      type Team { name: String, members: [TeamMember] }
      type TeamMember { user: User }
      type User { preferredName: String }
      type Subscription { logContext: String }
    `,
    resolvers: {
      Query: {
        team: async () => {
          await Promise.resolve()
          // what Kysely's log hook does once a query settles
          traceKyselyQuery({
            level: 'query',
            query: CompiledQuery.raw('select "name" from "Team" where "id" = $1', ['team1']),
            queryDurationMillis: 3
          })
          return {name: 'Team 1', members: [{}, {}, {}]}
        },
        crash: () => {
          throw new TypeError('boom')
        },
        denied: () => {
          throw new GraphQLError('Not authorized')
        },
        logContext: () => JSON.stringify(getLogContext()),
        warn: () => {
          Logger.warn('Careful')
          return 'warned'
        }
      },
      Team: {
        name: ({name}: {name: string}) => name
      },
      TeamMember: {
        user: async () => ({})
      },
      User: {
        preferredName: async () => 'Jordan'
      },
      Subscription: {
        logContext: {
          subscribe: async function* () {
            await new Promise((resolve) => setTimeout(resolve, 0))
            yield {}
          },
          resolve: () => JSON.stringify(getLogContext())
        }
      }
    }
  }),
  plugins: [useErrorLogging(), useTracing()],
  logging: Logger
})

const execute = async (query: string, serverContext?: Record<string, unknown>) => {
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({query})
    },
    {authToken: {sub: 'user1'}, ip: '203.0.113.7', ...serverContext}
  )
  return response.json()
}

const getSpan = (name: string) => {
  const span = exporter.getFinishedSpans().find((finishedSpan) => finishedSpan.name === name)
  if (!span) throw new Error(`No span named ${name}`)
  return span
}
const getParentSpanId = (span: ReadableSpan) => span.parentSpanContext?.spanId

let errorSpy: jest.SpyInstance
let warnSpy: jest.SpyInstance
beforeEach(() => {
  exporter.reset()
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  errorSpy.mockRestore()
  warnSpy.mockRestore()
})

test('a sampled operation traces the request, then its resolvers, then their Postgres queries, in the client trace', async () => {
  const result = await execute(
    'query TeamQuery { team { name members { user { preferredName } } } }',
    {traceparent: SAMPLED_TRACEPARENT, sessionId: 'session1'}
  )
  expect(result.data.team.members).toHaveLength(3)
  const operationSpan = getSpan('query TeamQuery')
  expect(operationSpan.kind).toBe(SpanKind.SERVER)
  expect(operationSpan.spanContext().traceId).toBe(CLIENT_TRACE_ID)
  expect(getParentSpanId(operationSpan)).toBe(CLIENT_SPAN_ID)
  expect(operationSpan.attributes).toMatchObject({
    'graphql.operation.name': 'TeamQuery',
    'graphql.operation.type': 'query',
    'user.id': 'user1',
    'session.id': 'session1'
  })
  const teamSpan = getSpan('Query.team')
  expect(getParentSpanId(teamSpan)).toBe(operationSpan.spanContext().spanId)
  const querySpan = getSpan('SELECT Team')
  expect(querySpan.kind).toBe(SpanKind.CLIENT)
  expect(getParentSpanId(querySpan)).toBe(teamSpan.spanContext().spanId)
  expect(querySpan.attributes).toEqual({
    'db.system.name': 'postgresql',
    'db.query.text': 'select "name" from "Team" where "id" = $1'
  })
  // a list traces its first item only, and a field without its own resolver nests under its nearest traced ancestor
  const userSpans = exporter.getFinishedSpans().filter(({name}) => name === 'TeamMember.user')
  expect(userSpans).toHaveLength(1)
  expect(userSpans[0]!.attributes['graphql.field.path']).toBe('team.members.*.user')
  expect(getParentSpanId(userSpans[0]!)).toBe(teamSpan.spanContext().spanId)
  // a scalar gets no span of its own, even with a resolver
  const spanNames = exporter.getFinishedSpans().map(({name}) => name)
  expect(spanNames).not.toContain('Team.name')
  expect(spanNames).not.toContain('User.preferredName')
})

test('an operation without a traceparent starts its own trace, and its logs share it', async () => {
  const result = await execute('query LogContext { logContext }')
  const operationSpan = getSpan('query LogContext')
  expect(operationSpan.parentSpanContext).toBeUndefined()
  expect(JSON.parse(result.data.logContext)).toMatchObject({
    traceId: operationSpan.spanContext().traceId,
    spanId: operationSpan.spanContext().spanId,
    traceSampled: true
  })
})

test('an operation that is not sampled records no spans, and its logs keep the client trace', async () => {
  const result = await execute('query LogContext { logContext }', {
    traceparent: `00-${CLIENT_TRACE_ID}-${CLIENT_SPAN_ID}-00`
  })
  expect(exporter.getFinishedSpans()).toHaveLength(0)
  const logContext = JSON.parse(result.data.logContext)
  expect(logContext).toMatchObject({traceId: CLIENT_TRACE_ID, traceSampled: false})
  expect(logContext.spanId).toMatch(/^[0-9a-f]{16}$/)
  expect(logContext.spanId).not.toBe(CLIENT_SPAN_ID)
})

test('a crash fails the resolver and operation spans with the exception, and its error log names the operation span', async () => {
  Reflect.set(globalThis, '__PRODUCTION__', true)
  try {
    await execute('query Crash { crash }', {traceparent: SAMPLED_TRACEPARENT})
  } finally {
    Reflect.set(globalThis, '__PRODUCTION__', false)
  }
  const operationSpan = getSpan('query Crash')
  const crashSpan = getSpan('Query.crash')
  for (const span of [operationSpan, crashSpan]) {
    expect(span.status.code).toBe(SpanStatusCode.ERROR)
    expect(span.events[0]).toMatchObject({
      name: 'exception',
      attributes: {'exception.type': 'TypeError', 'exception.message': 'boom'}
    })
  }
  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(JSON.parse(errorSpy.mock.calls[0][0])).toMatchObject({
    message: 'boom',
    trace_id: CLIENT_TRACE_ID,
    span_id: operationSpan.spanContext().spanId,
    trace_flags: '01'
  })
})

test('an intentional GraphQLError leaves the spans unfailed', async () => {
  await execute('query Denied { denied }', {traceparent: SAMPLED_TRACEPARENT})
  expect(getSpan('query Denied').status.code).toBe(SpanStatusCode.UNSET)
  expect(getSpan('Query.denied').status.code).toBe(SpanStatusCode.UNSET)
})

test('a line logged inside a resolver lands on the resolver span', async () => {
  Reflect.set(globalThis, '__PRODUCTION__', true)
  try {
    await execute('query Warn { warn }', {traceparent: SAMPLED_TRACEPARENT})
  } finally {
    Reflect.set(globalThis, '__PRODUCTION__', false)
  }
  expect(JSON.parse(warnSpy.mock.calls[0][0])).toMatchObject({
    message: 'Careful',
    trace_id: CLIENT_TRACE_ID,
    span_id: getSpan('Query.warn').spanContext().spanId
  })
})

test('a subscription span covers starting it, not the events that follow', async () => {
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {'content-type': 'application/json', accept: 'text/event-stream'},
      body: JSON.stringify({query: 'subscription LogContext { logContext }'})
    },
    {authToken: {sub: 'user1'}, traceparent: SAMPLED_TRACEPARENT}
  )
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let stream = ''
  while (!stream.includes('data: {')) {
    const {value, done} = await reader.read()
    if (done) break
    stream += decoder.decode(value)
  }
  await reader.cancel()
  const subscriptionSpan = getSpan('subscription LogContext')
  expect(subscriptionSpan.spanContext().traceId).toBe(CLIENT_TRACE_ID)
  expect(exporter.getFinishedSpans().map(({name}) => name)).not.toContain('Subscription.logContext')
})
