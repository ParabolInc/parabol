import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {getLogContext, type RequestLogContext} from '../../utils/requestLogContext'
import traceHttpRoute from '../traceHttpRoute'

jest.mock('../initTracing', () => ({TRACING_ENABLED: false}))

test('without tracing, a route still logs with its request and the trace its caller sent', () => {
  let seenContext: RequestLogContext | undefined
  const headers: Record<string, string> = {
    traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
  }
  const req = {
    getMethod: () => 'post',
    getUrl: () => '/oauth/token',
    getQuery: () => '',
    getHeader: (name: string) => headers[name] ?? ''
  } as unknown as HttpRequest
  traceHttpRoute('/oauth/token', () => {
    seenContext = getLogContext()
  })({status: ''} as unknown as HttpResponse, req)
  expect(seenContext).toMatchObject({
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    traceSampled: true,
    http: {method: 'POST', route: '/oauth/token', path: '/oauth/token'}
  })
})
