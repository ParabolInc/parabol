import {getGcpProjectId} from '../gcpProjectId'
import getTraceLogContext, {parseTraceparent} from '../getTraceLogContext'

jest.mock('../gcpProjectId', () => ({getGcpProjectId: jest.fn(() => undefined)}))

const TRACEPARENT = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'

test('parses a valid traceparent', () => {
  expect(parseTraceparent(TRACEPARENT)).toEqual({
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    parentSpanId: '00f067aa0ba902b7',
    sampled: true
  })
})

test('rejects missing, malformed and all-zero traceparents', () => {
  const invalidTraceparents = [
    undefined,
    42,
    '',
    'not-a-traceparent',
    '01-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
    '00-00000000000000000000000000000000-00f067aa0ba902b7-01',
    '00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01'
  ]
  invalidTraceparents.forEach((traceparent) => {
    expect(parseTraceparent(traceparent)).toBeNull()
  })
})

test('continues the browser trace with a new server span', () => {
  const traceLogContext = getTraceLogContext(TRACEPARENT)
  expect(traceLogContext.trace).toBe('4bf92f3577b34da6a3ce929d0e0e4736')
  expect(traceLogContext.spanId).toMatch(/^[0-9a-f]{16}$/)
  expect(traceLogContext.spanId).not.toBe('00f067aa0ba902b7')
  expect(traceLogContext.traceSampled).toBe(true)
})

test('starts a fresh trace when the request has none', () => {
  const traceLogContext = getTraceLogContext(undefined)
  expect(traceLogContext.trace).toMatch(/^[0-9a-f]{32}$/)
  expect(traceLogContext.traceSampled).toBe(false)
})

test('uses the full Cloud Logging trace name once the project is known', () => {
  jest.mocked(getGcpProjectId).mockReturnValueOnce('parabol-saas-production')
  expect(getTraceLogContext(TRACEPARENT).trace).toBe(
    'projects/parabol-saas-production/traces/4bf92f3577b34da6a3ce929d0e0e4736'
  )
})
