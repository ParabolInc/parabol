import type {Attributes} from '@opentelemetry/api'
import recordSpanError from './recordSpanError'
import tracer from './tracer'

const traceAsync = <T>(name: string, fn: () => Promise<T>, attributes?: Attributes) =>
  tracer.startActiveSpan(name, {attributes}, async (span) => {
    try {
      return await fn()
    } catch (error) {
      recordSpanError(span, error)
      throw error
    } finally {
      span.end()
    }
  })

export default traceAsync
