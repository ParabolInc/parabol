import {context, ROOT_CONTEXT, TraceFlags, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  createAlwaysRecordSampler,
  InMemorySpanExporter,
  ParentBasedSampler,
  SimpleSpanProcessor,
  TracerProvider
} from '@opentelemetry/sdk-trace'
import FailedTraceSpanProcessor from '../FailedTraceSpanProcessor'

context.setGlobalContextManager(new AsyncLocalStorageContextManager())

const makeTracer = (isSampled: boolean) => {
  const exporter = new InMemorySpanExporter()
  const processor = new FailedTraceSpanProcessor(new SimpleSpanProcessor({exporter}))
  const ratioSampler = isSampled ? new AlwaysOnSampler() : new AlwaysOffSampler()
  const provider = new TracerProvider({
    sampler: createAlwaysRecordSampler(new ParentBasedSampler({root: ratioSampler})),
    spanProcessors: [processor]
  })
  return {tracer: provider.getTracer('test'), exporter, processor}
}

// a request with a query in it, the shape a failing GraphQL operation has
const runRequest = (
  tracer: ReturnType<typeof makeTracer>['tracer'],
  beforeEnd?: (traceId: string) => void
) => {
  const requestSpan = tracer.startSpan('query TeamQuery', {}, ROOT_CONTEXT)
  const requestContext = trace.setSpan(ROOT_CONTEXT, requestSpan)
  tracer.startSpan('SELECT Team', {}, requestContext).end()
  const {traceId} = requestSpan.spanContext()
  beforeEnd?.(traceId)
  requestSpan.end()
  return traceId
}

test('an unsampled request that succeeds is never exported', () => {
  const {tracer, exporter} = makeTracer(false)
  runRequest(tracer)
  expect(exporter.getFinishedSpans()).toHaveLength(0)
})

test('an unsampled request that logs an error is exported whole, marked sampled', () => {
  const {tracer, exporter, processor} = makeTracer(false)
  let isKept = false
  runRequest(tracer, (traceId) => {
    isKept = processor.keepTrace(traceId)
  })
  expect(isKept).toBe(true)
  const spans = exporter.getFinishedSpans()
  expect(spans.map(({name}) => name)).toEqual(['SELECT Team', 'query TeamQuery'])
  expect(spans.every((span) => span.spanContext().traceFlags === TraceFlags.SAMPLED)).toBe(true)
  expect(spans[0]!.parentSpanContext?.spanId).toBe(spans[1]!.spanContext().spanId)
})

test('an error logged just after the response still exports its request', () => {
  const {tracer, exporter, processor} = makeTracer(false)
  const traceId = runRequest(tracer)
  expect(processor.keepTrace(traceId)).toBe(true)
  expect(exporter.getFinishedSpans()).toHaveLength(2)
})

test('a sampled request is exported as before and needs nothing kept', () => {
  const {tracer, exporter, processor} = makeTracer(true)
  const traceId = runRequest(tracer)
  expect(exporter.getFinishedSpans()).toHaveLength(2)
  expect(processor.keepTrace(traceId)).toBe(false)
})

test('a trace this process never recorded is not claimed', () => {
  const {processor} = makeTracer(false)
  expect(processor.keepTrace('4bf92f3577b34da6a3ce929d0e0e4736')).toBe(false)
})

test('old finished requests make room for new ones', () => {
  const {tracer, exporter, processor} = makeTracer(false)
  const firstTraceId = runRequest(tracer)
  for (let i = 0; i < 2500; i++) runRequest(tracer)
  expect(processor.keepTrace(firstTraceId)).toBe(false)
  expect(exporter.getFinishedSpans()).toHaveLength(0)
})
