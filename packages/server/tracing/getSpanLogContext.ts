import {type SpanContext, TraceFlags} from '@opentelemetry/api'
import type {RequestLogContext} from '../utils/requestLogContext'

const getSpanLogContext = ({
  traceId,
  spanId,
  traceFlags
}: SpanContext): Pick<RequestLogContext, 'traceId' | 'spanId' | 'traceSampled'> => ({
  traceId,
  spanId,
  traceSampled: (traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED
})

export default getSpanLogContext
