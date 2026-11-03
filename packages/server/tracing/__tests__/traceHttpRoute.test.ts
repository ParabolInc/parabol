import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {context, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {InMemorySpanExporter, SimpleSpanProcessor, TracerProvider} from '@opentelemetry/sdk-trace'
import traceHttpRoute from '../traceHttpRoute'

jest.mock('../initTracing', () => ({TRACING_ENABLED: true}))

const exporter = new InMemorySpanExporter()
trace.setGlobalTracerProvider(
  new TracerProvider({spanProcessors: [new SimpleSpanProcessor({exporter})]})
)
context.setGlobalContextManager(new AsyncLocalStorageContextManager())

beforeEach(() => {
  exporter.reset()
})

const makeRequest = (method: string, url: string) =>
  ({getMethod: () => method, getUrl: () => url}) as unknown as HttpRequest

const makeResponse = () => ({status: ''}) as unknown as HttpResponse

test('a route becomes a server span named for its pattern, active while the handler runs', async () => {
  let activeSpanId: string | undefined
  const handler = traceHttpRoute('/saml/:domain', async () => {
    await Promise.resolve()
    activeSpanId = trace.getActiveSpan()?.spanContext().spanId
  })
  await handler(makeResponse(), makeRequest('post', '/saml/parabol.co'))
  const [span] = exporter.getFinishedSpans()
  expect(span?.name).toBe('POST /saml/:domain')
  expect(span?.kind).toBe(SpanKind.SERVER)
  expect(span?.attributes).toMatchObject({
    'http.request.method': 'POST',
    'http.route': '/saml/:domain',
    'url.path': '/saml/parabol.co',
    'http.response.status_code': 200
  })
  expect(span?.status.code).toBe(SpanStatusCode.UNSET)
  expect(activeSpanId).toBe(span?.spanContext().spanId)
})

test('a 5xx the handler wrote marks the span errored', async () => {
  const res = makeResponse()
  const handler = traceHttpRoute('/stripe', async (response) => {
    response.status = '503'
  })
  await handler(res, makeRequest('post', '/stripe'))
  const [span] = exporter.getFinishedSpans()
  expect(span?.attributes['http.response.status_code']).toBe(503)
  expect(span?.status.code).toBe(SpanStatusCode.ERROR)
})

test('a 4xx with a reason phrase is recorded without marking the span errored', async () => {
  const handler = traceHttpRoute('/oauth/token', (response) => {
    response.status = '400 Bad Request'
  })
  handler(makeResponse(), makeRequest('post', '/oauth/token'))
  const [span] = exporter.getFinishedSpans()
  expect(span?.attributes['http.response.status_code']).toBe(400)
  expect(span?.status.code).toBe(SpanStatusCode.UNSET)
})

test('a handler that rejects records the error and still rejects', async () => {
  const handler = traceHttpRoute('/zoom', async () => {
    throw new Error('boom')
  })
  await expect(handler(makeResponse(), makeRequest('post', '/zoom'))).rejects.toThrow('boom')
  const [span] = exporter.getFinishedSpans()
  expect(span?.status.code).toBe(SpanStatusCode.ERROR)
  expect(span?.events[0]?.name).toBe('exception')
})
