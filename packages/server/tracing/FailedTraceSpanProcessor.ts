import {type Context, type SpanContext, TraceFlags} from '@opentelemetry/api'
import type {ReadableSpan, Span, SpanProcessor} from '@opentelemetry/sdk-trace'

// a few MB at most. A request that finished stays here until newer ones push it out, in case its error is logged late
const MAX_BUFFERED_SPANS = 4000
const MAX_SPANS_PER_TRACE = 500
// also bounds traces whose spans never end
const MAX_UNSAMPLED_TRACES = 2000

interface UnsampledTrace {
  spans: ReadableSpan[]
  openSpanCount: number
  isFailed: boolean
}

const isSampled = ({traceFlags}: SpanContext) =>
  (traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED

// the exporter's processor drops spans not marked sampled, so a kept trace's spans are re-marked
const markSampled = (span: ReadableSpan): ReadableSpan => {
  const spanContext = {...span.spanContext(), traceFlags: TraceFlags.SAMPLED}
  return {
    name: span.name,
    kind: span.kind,
    spanContext: () => spanContext,
    parentSpanContext: span.parentSpanContext,
    startTime: span.startTime,
    endTime: span.endTime,
    status: span.status,
    attributes: span.attributes,
    links: span.links,
    events: span.events,
    duration: span.duration,
    ended: span.ended,
    resource: span.resource,
    instrumentationScope: span.instrumentationScope,
    droppedAttributesCount: span.droppedAttributesCount,
    droppedEventsCount: span.droppedEventsCount,
    droppedLinksCount: span.droppedLinksCount
  }
}

// The sampler records every request but marks only a share sampled. This processor exports the sampled ones as usual
// and holds the rest in memory, so a request that logs an error is exported whole even when it was not sampled
class FailedTraceSpanProcessor implements SpanProcessor {
  private readonly unsampledTraces = new Map<string, UnsampledTrace>()
  private bufferedSpanCount = 0

  constructor(private readonly exportProcessor: SpanProcessor) {}

  onStart(span: Span, parentContext: Context) {
    const spanContext = span.spanContext()
    if (isSampled(spanContext)) {
      this.exportProcessor.onStart(span, parentContext)
      return
    }
    const {traceId} = spanContext
    const unsampledTrace = this.unsampledTraces.get(traceId)
    if (unsampledTrace) {
      unsampledTrace.openSpanCount++
    } else {
      this.unsampledTraces.set(traceId, {spans: [], openSpanCount: 1, isFailed: false})
      if (this.unsampledTraces.size > MAX_UNSAMPLED_TRACES) {
        const [oldestTraceId, oldestTrace] = this.unsampledTraces.entries().next().value!
        this.bufferedSpanCount -= oldestTrace.spans.length
        this.unsampledTraces.delete(oldestTraceId)
      }
    }
  }

  onEnd(span: ReadableSpan) {
    const spanContext = span.spanContext()
    if (isSampled(spanContext)) {
      this.exportProcessor.onEnd(span)
      return
    }
    const {traceId} = spanContext
    const unsampledTrace = this.unsampledTraces.get(traceId)
    if (!unsampledTrace) return
    unsampledTrace.openSpanCount--
    if (unsampledTrace.isFailed) {
      this.exportProcessor.onEnd(markSampled(span))
      if (unsampledTrace.openSpanCount <= 0) {
        this.unsampledTraces.delete(traceId)
      }
      return
    }
    if (unsampledTrace.spans.length < MAX_SPANS_PER_TRACE) {
      unsampledTrace.spans.push(span)
      this.bufferedSpanCount++
      this.evictOldestTraces()
    }
  }

  // true when the trace's spans will be exported: the ones that ended now, the rest as they end
  keepTrace(traceId: string) {
    const unsampledTrace = this.unsampledTraces.get(traceId)
    if (!unsampledTrace) return false
    if (unsampledTrace.isFailed) return true
    unsampledTrace.isFailed = true
    unsampledTrace.spans.forEach((span) => this.exportProcessor.onEnd(markSampled(span)))
    this.bufferedSpanCount -= unsampledTrace.spans.length
    unsampledTrace.spans = []
    if (unsampledTrace.openSpanCount <= 0) {
      this.unsampledTraces.delete(traceId)
    }
    return true
  }

  private evictOldestTraces() {
    for (const [traceId, unsampledTrace] of this.unsampledTraces) {
      if (this.bufferedSpanCount <= MAX_BUFFERED_SPANS) return
      if (unsampledTrace.isFailed) continue
      this.bufferedSpanCount -= unsampledTrace.spans.length
      this.unsampledTraces.delete(traceId)
    }
  }

  forceFlush() {
    return this.exportProcessor.forceFlush()
  }

  shutdown() {
    return this.exportProcessor.shutdown()
  }
}

export default FailedTraceSpanProcessor
