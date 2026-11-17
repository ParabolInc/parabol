import {type Span, SpanStatusCode} from '@opentelemetry/api'

const recordSpanError = (span: Span, error: unknown) => {
  span.recordException(error instanceof Error ? error : String(error))
  span.setStatus({code: SpanStatusCode.ERROR})
}

export default recordSpanError
