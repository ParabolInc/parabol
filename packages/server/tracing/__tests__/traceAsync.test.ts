import {context, SpanStatusCode, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {InMemorySpanExporter, SimpleSpanProcessor, TracerProvider} from '@opentelemetry/sdk-trace'
import traceAsync from '../traceAsync'
import tracer from '../tracer'

const exporter = new InMemorySpanExporter()
trace.setGlobalTracerProvider(
  new TracerProvider({spanProcessors: [new SimpleSpanProcessor({exporter})]})
)
context.setGlobalContextManager(new AsyncLocalStorageContextManager())

beforeEach(() => {
  exporter.reset()
})

test('the span is active while the work runs and ends with its result', async () => {
  const result = await traceAsync(
    'hocusPocus.updatePageContent',
    {documentName: 'page:1'},
    async () => trace.getActiveSpan()
  )
  const [span] = exporter.getFinishedSpans()
  expect(span?.name).toBe('hocusPocus.updatePageContent')
  expect(span?.attributes).toEqual({documentName: 'page:1'})
  expect(span?.spanContext().spanId).toBe(result?.spanContext().spanId)
})

test('a failure marks the span errored and still rejects', async () => {
  await expect(
    tracer.startActiveSpan('request', async (requestSpan) => {
      try {
        await traceAsync('startRecurringMeeting', {}, async () => {
          throw new Error('boom')
        })
      } finally {
        requestSpan.end()
      }
    })
  ).rejects.toThrow('boom')
  const span = exporter.getFinishedSpans().find(({name}) => name === 'startRecurringMeeting')
  expect(span?.status.code).toBe(SpanStatusCode.ERROR)
  expect(span?.events[0]?.name).toBe('exception')
  expect(span?.parentSpanContext?.spanId).toBe(
    exporter
      .getFinishedSpans()
      .find(({name}) => name === 'request')
      ?.spanContext().spanId
  )
})
