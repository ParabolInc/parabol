import {subscribe} from 'node:diagnostics_channel'
import type {ClientRequest, IncomingMessage} from 'node:http'
import {context, type Span, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {isTracingSuppressed} from '@opentelemetry/core'
import getVendorHost from '../utils/getVendorHost'
import {
  getCurrentOperation,
  type OperationVendorWait,
  type VendorRequestInterval,
  vendorRequestDuration
} from '../utils/vendorWait'
import recordSpanError from './recordSpanError'
import tracer from './tracer'

interface UndiciRequest {
  origin: string | URL
  method: string
  path: string
}

interface VendorRequest {
  host: string
  start: number
  operation: OperationVendorWait | undefined
  // set when the vendor answers, then stretched to the end of the response body
  answered?: VendorRequestInterval
}

const requestSpans = new WeakMap<object, Span>()
const vendorRequests = new WeakMap<object, VendorRequest>()

const startRequestSpan = (request: object, method: string, host: string, path: string) => {
  const span = tracer.startSpan(`${method} ${host}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'http.request.method': method,
      'server.address': host,
      // the query string can hold credentials
      'url.path': path.split('?')[0]!
    }
  })
  requestSpans.set(request, span)
}

const endRequestSpan = (request: object, statusCode?: number, error?: unknown) => {
  const span = requestSpans.get(request)
  if (!span) return
  requestSpans.delete(request)
  if (statusCode) {
    span.setAttribute('http.response.status_code', statusCode)
  }
  if (error) {
    recordSpanError(span, error)
  } else if (statusCode && statusCode >= 500) {
    span.setStatus({code: SpanStatusCode.ERROR})
  }
  span.end()
}

const startVendorRequest = (request: object, hostname: string) => {
  const host = getVendorHost(hostname)
  if (!host) return
  vendorRequests.set(request, {host, start: performance.now(), operation: getCurrentOperation()})
}

const answerVendorRequest = (request: object, statusCode?: number) => {
  const vendorRequest = vendorRequests.get(request)
  if (!vendorRequest || vendorRequest.answered) return
  const {host, start, operation} = vendorRequest
  const end = performance.now()
  const status_class = statusCode ? `${Math.floor(statusCode / 100)}xx` : 'error'
  vendorRequestDuration.observe({host, status_class}, (end - start) / 1000)
  vendorRequest.answered = {start, end}
  operation?.answeredRequests.push(vendorRequest.answered)
}

// a streamed response, like an LLM's, keeps the operation waiting until its body ends
const finishVendorResponse = (request: object) => {
  const answered = vendorRequests.get(request)?.answered
  if (!answered) return
  answered.end = performance.now()
  vendorRequests.delete(request)
}

const startRequest = (request: object, method: string, host: string, path: string) => {
  const activeContext = context.active()
  // the exporter's own requests run with tracing suppressed, or every export would make a span to export
  if (isTracingSuppressed(activeContext)) return
  if (trace.getSpan(activeContext)?.isRecording()) {
    startRequestSpan(request, method, host, path)
  }
  startVendorRequest(request, host)
}

const failRequest = (request: object, error: unknown) => {
  endRequestSpan(request, undefined, error)
  answerVendorRequest(request)
  finishVendorResponse(request)
}

// Node rethrows a subscriber's exception as an uncaught exception, so nothing here may throw
const traceOutboundHttp = () => {
  subscribe('http.client.request.created', (message) => {
    const {request} = message as {request: ClientRequest}
    startRequest(request, request.method, request.host, request.path)
  })
  subscribe('http.client.response.finish', (message) => {
    const {request, response} = message as {request: ClientRequest; response: IncomingMessage}
    endRequestSpan(request, response.statusCode)
    answerVendorRequest(request, response.statusCode)
    if (vendorRequests.has(request)) {
      response.once('close', () => finishVendorResponse(request))
    }
  })
  subscribe('http.client.request.error', (message) => {
    const {request, error} = message as {request: ClientRequest; error: unknown}
    failRequest(request, error)
  })
  subscribe('undici:request:create', (message) => {
    const {request} = message as {request: UndiciRequest}
    const origin = String(request.origin)
    startRequest(request, request.method, URL.parse(origin)?.hostname ?? origin, request.path)
  })
  subscribe('undici:request:headers', (message) => {
    const {request, response} = message as {request: UndiciRequest; response: {statusCode: number}}
    endRequestSpan(request, response.statusCode)
    answerVendorRequest(request, response.statusCode)
  })
  subscribe('undici:request:trailers', (message) => {
    const {request} = message as {request: UndiciRequest}
    finishVendorResponse(request)
  })
  subscribe('undici:request:error', (message) => {
    const {request, error} = message as {request: UndiciRequest; error: unknown}
    failRequest(request, error)
  })
}

export default traceOutboundHttp
