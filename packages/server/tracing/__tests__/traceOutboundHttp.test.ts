import http from 'node:http'
import type {AddressInfo} from 'node:net'
import {context, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {suppressTracing} from '@opentelemetry/core'
import {InMemorySpanExporter, SimpleSpanProcessor, TracerProvider} from '@opentelemetry/sdk-trace'
import traceOutboundHttp from '../traceOutboundHttp'
import tracer from '../tracer'

const exporter = new InMemorySpanExporter()
trace.setGlobalTracerProvider(
  new TracerProvider({spanProcessors: [new SimpleSpanProcessor({exporter})]})
)
context.setGlobalContextManager(new AsyncLocalStorageContextManager())
traceOutboundHttp()

const server = http.createServer((req, res) => {
  res.statusCode = req.url?.startsWith('/down') ? 503 : 200
  res.end('ok')
})
let origin: string
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})
afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})
beforeEach(() => {
  exporter.reset()
})

const getWithNodeHttp = (url: string) =>
  new Promise<void>((resolve, reject) => {
    http
      .get(url, (res) => {
        res.resume()
        res.on('end', resolve)
      })
      .on('error', reject)
  })

const inRequest = (send: () => Promise<unknown>) =>
  tracer.startActiveSpan('request', async (span) => {
    await send()
    span.end()
    return span
  })

test.each([
  ['node:http', getWithNodeHttp],
  ['fetch', (url: string) => fetch(url).then((res) => res.text())]
])(
  'a request sent with %s during a sampled request becomes a client span, without its query string',
  async (_client, send) => {
    const requestSpan = await inRequest(() => send(`${origin}/integrations/jira?token=secret`))
    const httpSpan = exporter.getFinishedSpans().find(({name}) => name === 'GET 127.0.0.1')!
    expect(httpSpan.kind).toBe(SpanKind.CLIENT)
    expect(httpSpan.parentSpanContext?.spanId).toBe(requestSpan.spanContext().spanId)
    expect(httpSpan.attributes).toEqual({
      'http.request.method': 'GET',
      'server.address': '127.0.0.1',
      'url.path': '/integrations/jira',
      'http.response.status_code': 200
    })
  }
)

test('a server error fails the span', async () => {
  await inRequest(() => getWithNodeHttp(`${origin}/down`))
  const httpSpan = exporter.getFinishedSpans().find(({name}) => name === 'GET 127.0.0.1')!
  expect(httpSpan.status.code).toBe(SpanStatusCode.ERROR)
})

test('a request outside a sampled request, or with tracing suppressed as the exporter does, makes no span', async () => {
  await getWithNodeHttp(`${origin}/`)
  await tracer.startActiveSpan('request', async (span) => {
    await context.with(suppressTracing(context.active()), () => fetch(`${origin}/`))
    span.end()
  })
  expect(exporter.getFinishedSpans().map(({name}) => name)).toEqual(['request'])
})
