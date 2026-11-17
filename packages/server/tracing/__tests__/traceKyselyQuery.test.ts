import {context, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {InMemorySpanExporter, SimpleSpanProcessor, TracerProvider} from '@opentelemetry/sdk-trace'
import {CompiledQuery} from 'kysely'
import traceKyselyQuery from '../traceKyselyQuery'
import tracer from '../tracer'

const exporter = new InMemorySpanExporter()
trace.setGlobalTracerProvider(
  new TracerProvider({spanProcessors: [new SimpleSpanProcessor({exporter})]})
)
context.setGlobalContextManager(new AsyncLocalStorageContextManager())

beforeEach(() => {
  exporter.reset()
})

const traceInRequest = (sql: string, error?: Error) =>
  tracer.startActiveSpan('request', (requestSpan) => {
    const query = CompiledQuery.raw(sql, ['user1'])
    traceKyselyQuery(
      error
        ? {level: 'error', error, query, queryDurationMillis: 40}
        : {level: 'query', query, queryDurationMillis: 40}
    )
    requestSpan.end()
    return requestSpan
  })

test('a query becomes a client span named for its operation and table, starting when it was sent', () => {
  const requestSpan = traceInRequest('update "User" set "lastSeenAt" = now() where "id" = $1')
  const querySpan = exporter.getFinishedSpans().find(({name}) => name === 'UPDATE User')!
  expect(querySpan.kind).toBe(SpanKind.CLIENT)
  expect(querySpan.parentSpanContext?.spanId).toBe(requestSpan.spanContext().spanId)
  const [seconds, nanoseconds] = querySpan.duration
  expect(seconds * 1000 + nanoseconds / 1e6).toBeCloseTo(40)
})

test('a failed query records its error', () => {
  traceInRequest('select * from "Team" where "id" = $1', new Error('canceling statement'))
  const querySpan = exporter.getFinishedSpans().find(({name}) => name === 'SELECT Team')!
  expect(querySpan.status.code).toBe(SpanStatusCode.ERROR)
  expect(querySpan.events[0]?.attributes?.['exception.message']).toBe('canceling statement')
})

test('a query outside a sampled request makes no span', () => {
  traceKyselyQuery({
    level: 'query',
    query: CompiledQuery.raw('select 1', []),
    queryDurationMillis: 1
  })
  expect(exporter.getFinishedSpans()).toHaveLength(0)
})
