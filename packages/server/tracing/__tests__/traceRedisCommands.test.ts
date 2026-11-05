import {tracingChannel} from 'node:diagnostics_channel'
import {context, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {InMemorySpanExporter, SimpleSpanProcessor, TracerProvider} from '@opentelemetry/sdk-trace'
import traceRedisCommands from '../traceRedisCommands'
import tracer from '../tracer'

const exporter = new InMemorySpanExporter()
trace.setGlobalTracerProvider(
  new TracerProvider({spanProcessors: [new SimpleSpanProcessor({exporter})]})
)
context.setGlobalContextManager(new AsyncLocalStorageContextManager())
traceRedisCommands()

// what ioredis 5.11 publishes for every command it writes
const sendCommand = (command: string, reply: Promise<unknown>) =>
  tracingChannel('ioredis:command').tracePromise(() => reply, {
    command,
    args: ['?'],
    database: 0,
    serverAddress: 'valkey',
    serverPort: 6379
  })

beforeEach(() => {
  exporter.reset()
})

test('a command sent during a sampled request becomes a client span, without its arguments', async () => {
  const requestSpan = await tracer.startActiveSpan('request', async (span) => {
    await sendCommand('get', Promise.resolve('value'))
    span.end()
    return span
  })
  const commandSpan = exporter.getFinishedSpans().find(({name}) => name === 'GET')!
  expect(commandSpan.kind).toBe(SpanKind.CLIENT)
  expect(commandSpan.parentSpanContext?.spanId).toBe(requestSpan.spanContext().spanId)
  expect(commandSpan.attributes).toEqual({
    'db.system.name': 'redis',
    'db.operation.name': 'GET',
    'db.namespace': '0',
    'server.address': 'valkey',
    'server.port': 6379
  })
})

test('a failed command records its error', async () => {
  await tracer.startActiveSpan('request', async (span) => {
    await sendCommand('set', Promise.reject(new Error('READONLY'))).catch(() => {})
    span.end()
  })
  const commandSpan = exporter.getFinishedSpans().find(({name}) => name === 'SET')!
  expect(commandSpan.status.code).toBe(SpanStatusCode.ERROR)
  expect(commandSpan.events[0]?.attributes?.['exception.message']).toBe('READONLY')
})

test('a command outside a sampled request makes no span', async () => {
  await sendCommand('publish', Promise.resolve(1))
  expect(exporter.getFinishedSpans()).toHaveLength(0)
})
