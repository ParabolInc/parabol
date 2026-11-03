import {type Attributes, SpanStatusCode} from '@opentelemetry/api'
import tracer from './tracer'

const traceAsync = <T>(name: string, attributes: Attributes, fn: () => Promise<T>) =>
  tracer.startActiveSpan(name, {attributes}, async (span) => {
    try {
      return await fn()
    } catch (error) {
      span.recordException(error instanceof Error ? error : String(error))
      span.setStatus({code: SpanStatusCode.ERROR})
      throw error
    } finally {
      span.end()
    }
  })

export default traceAsync
