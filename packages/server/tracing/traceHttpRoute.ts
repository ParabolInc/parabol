import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {context, ROOT_CONTEXT, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import {TRACING_ENABLED} from './initTracing'
import recordSpanError from './recordSpanError'
import tracer from './tracer'

type RouteHandler = (res: HttpResponse, req: HttpRequest) => void | Promise<void>

// safetyPatchRes keeps the status a handler wrote, like '503' or '405 Method Not Allowed', and leaves it empty for a 200
const getStatusCode = (res: HttpResponse) => Number.parseInt(String(res.status || '200'), 10)

const traceHttpRoute =
  (route: string, handler: RouteHandler): RouteHandler =>
  (res, req) => {
    if (!TRACING_ENABLED) return handler(res, req)
    const method = req.getMethod().toUpperCase()
    const span = tracer.startSpan(
      `${method} ${route}`,
      {
        kind: SpanKind.SERVER,
        attributes: {'http.request.method': method, 'http.route': route, 'url.path': req.getUrl()}
      },
      ROOT_CONTEXT
    )
    const endSpan = () => {
      const statusCode = getStatusCode(res)
      span.setAttribute('http.response.status_code', statusCode)
      if (statusCode >= 500) {
        span.setStatus({code: SpanStatusCode.ERROR})
      }
      span.end()
    }
    const result = context.with(trace.setSpan(ROOT_CONTEXT, span), () => handler(res, req))
    if (!(result instanceof Promise)) {
      endSpan()
      return
    }
    return result.then(
      () => {
        endSpan()
      },
      (error) => {
        recordSpanError(span, error)
        span.end()
        throw error
      }
    )
  }

export default traceHttpRoute
