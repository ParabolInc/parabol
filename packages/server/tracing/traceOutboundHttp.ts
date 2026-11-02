import {subscribe} from 'node:diagnostics_channel'
import type {ClientRequest, IncomingMessage} from 'node:http'
import {context, type Span, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {isTracingSuppressed} from '@opentelemetry/core'
import tracer from './tracer'

interface UndiciRequest {
  origin: string | URL
  method: string
  path: string
}

const requestSpans = new WeakMap<object, Span>()

// the exporter's own requests run with tracing suppressed, or every export would make a span to export
const isInSampledRequest = () => {
  const activeContext = context.active()
  return !isTracingSuppressed(activeContext) && !!trace.getSpan(activeContext)?.isRecording()
}

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
    span.recordException(error instanceof Error ? error : String(error))
  }
  if (error || (statusCode && statusCode >= 500)) {
    span.setStatus({code: SpanStatusCode.ERROR})
  }
  span.end()
}

// Node rethrows a subscriber's exception as an uncaught exception, so nothing here may throw
const traceOutboundHttp = () => {
  subscribe('http.client.request.created', (message) => {
    if (!isInSampledRequest()) return
    const {request} = message as {request: ClientRequest}
    startRequestSpan(request, request.method, request.host, request.path)
  })
  subscribe('http.client.response.finish', (message) => {
    const {request, response} = message as {request: ClientRequest; response: IncomingMessage}
    endRequestSpan(request, response.statusCode)
  })
  subscribe('http.client.request.error', (message) => {
    const {request, error} = message as {request: ClientRequest; error: unknown}
    endRequestSpan(request, undefined, error)
  })
  subscribe('undici:request:create', (message) => {
    if (!isInSampledRequest()) return
    const {request} = message as {request: UndiciRequest}
    const origin = String(request.origin)
    startRequestSpan(request, request.method, URL.parse(origin)?.hostname ?? origin, request.path)
  })
  subscribe('undici:request:headers', (message) => {
    const {request, response} = message as {request: UndiciRequest; response: {statusCode: number}}
    endRequestSpan(request, response.statusCode)
  })
  subscribe('undici:request:error', (message) => {
    const {request, error} = message as {request: UndiciRequest; error: unknown}
    endRequestSpan(request, undefined, error)
  })
}

export default traceOutboundHttp
