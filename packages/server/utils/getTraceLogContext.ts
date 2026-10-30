import {randomBytes} from 'node:crypto'
import type {RequestLogContext} from './requestLogContext'

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/
const ALL_ZEROS = /^0+$/

export const parseTraceparent = (traceparent: unknown) => {
  if (typeof traceparent !== 'string') return null
  const match = traceparent.trim().toLowerCase().match(TRACEPARENT)
  if (!match) return null
  const [, traceId = '', parentSpanId = '', flags = ''] = match
  if (ALL_ZEROS.test(traceId) || ALL_ZEROS.test(parentSpanId)) return null
  return {traceId, parentSpanId, sampled: (parseInt(flags, 16) & 1) === 1}
}

const getTraceLogContext = (
  traceparent: unknown
): Pick<RequestLogContext, 'traceId' | 'spanId' | 'traceSampled'> => {
  const parsedTraceparent = parseTraceparent(traceparent)
  return {
    traceId: parsedTraceparent?.traceId ?? randomBytes(16).toString('hex'),
    spanId: randomBytes(8).toString('hex'),
    traceSampled: parsedTraceparent?.sampled ?? false
  }
}

export default getTraceLogContext
