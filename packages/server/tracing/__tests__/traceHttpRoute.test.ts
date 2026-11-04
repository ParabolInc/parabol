import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {context, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {InMemorySpanExporter, SimpleSpanProcessor, TracerProvider} from '@opentelemetry/sdk-trace'
import parseBody from '../../parseBody'
import {getLogContext, type RequestLogContext} from '../../utils/requestLogContext'
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

const makeRequest = (
  method: string,
  url: string,
  {query = '', headers = {}}: {query?: string; headers?: Record<string, string>} = {}
) =>
  ({
    getMethod: () => method,
    getUrl: () => url,
    getQuery: () => query,
    getHeader: (name: string) => headers[name] ?? ''
  }) as unknown as HttpRequest

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

test('code in a route sees its request, and the status once the handler writes it', async () => {
  let contextBeforeStatus: RequestLogContext | undefined
  let statusAfterWrite: number | undefined
  const handler = traceHttpRoute('/scim/Users/:id', async (response) => {
    contextBeforeStatus = getLogContext()
    response.status = '409'
    statusAfterWrite = getLogContext()?.http?.getStatus?.()
  })
  await handler(
    makeResponse(),
    makeRequest('put', '/scim/Users/abc', {
      query: 'attributes=userName',
      headers: {'content-type': 'application/scim+json'}
    })
  )
  expect(contextBeforeStatus?.http).toMatchObject({
    method: 'PUT',
    route: '/scim/Users/:id',
    path: '/scim/Users/abc',
    query: 'attributes=userName',
    contentType: 'application/scim+json'
  })
  expect(contextBeforeStatus?.spanId).toBeUndefined()
  expect(statusAfterWrite).toBe(409)
})

test('a body read with parseBody joins the log context, copied out of the memory uWS reuses', async () => {
  let onData: ((chunk: ArrayBuffer, isLast: boolean) => void) | undefined
  const res = {
    status: '',
    onData: (callback: typeof onData) => {
      onData = callback
    }
  } as unknown as HttpResponse
  let parsedBody: unknown
  let contextBody: Buffer | undefined
  const handler = traceHttpRoute('/zoom', async (response) => {
    const bodyPromise = parseBody({res: response})
    const chunk = new TextEncoder().encode('{"event":"endpoint.url_validation"}')
    onData!(chunk.buffer as ArrayBuffer, true)
    chunk.fill(0)
    parsedBody = await bodyPromise
    contextBody = getLogContext()?.http?.body
  })
  await handler(res, makeRequest('post', '/zoom'))
  expect(parsedBody).toEqual({event: 'endpoint.url_validation'})
  expect(contextBody?.toString()).toBe('{"event":"endpoint.url_validation"}')
})
