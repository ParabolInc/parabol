import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {context, ROOT_CONTEXT, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import getTraceLogContext from '../utils/getTraceLogContext'
import {type HttpLogContext, runWithLogContext} from '../utils/requestLogContext'
import {TRACING_ENABLED} from './initTracing'
import recordSpanError from './recordSpanError'
import tracer from './tracer'

type RouteHandler = (res: HttpResponse, req: HttpRequest) => void | Promise<void>

// safetyPatchRes keeps the status a handler wrote, like '503' or '405 Method Not Allowed', and leaves it empty for a 200
const getStatusCode = (res: HttpResponse) => Number.parseInt(String(res.status || '200'), 10)

const getWrittenStatusCode = (res: HttpResponse) =>
  res.status ? getStatusCode(res) : res.done ? 200 : undefined

const traceRequest = (
  route: string,
  {method, path}: HttpLogContext,
  handler: RouteHandler,
  res: HttpResponse,
  req: HttpRequest
) => {
  const span = tracer.startSpan(
    `${method} ${route}`,
    {
      kind: SpanKind.SERVER,
      attributes: {'http.request.method': method, 'http.route': route, 'url.path': path}
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

const traceHttpRoute =
  (route: string, handler: RouteHandler): RouteHandler =>
  (res, req) => {
    // uWS frees the request at the handler's first await, so it is read up front
    const http: HttpLogContext = {
      method: req.getMethod().toUpperCase(),
      route,
      path: req.getUrl(),
      query: req.getQuery() || undefined,
      contentType: req.getHeader('content-type') || undefined,
      getStatus: () => getWrittenStatusCode(res)
    }
    const traceLogContext = TRACING_ENABLED
      ? undefined
      : getTraceLogContext(req.getHeader('traceparent'))
    return runWithLogContext({...traceLogContext, http}, () =>
      TRACING_ENABLED ? traceRequest(route, http, handler, res, req) : handler(res, req)
    )
  }

export default traceHttpRoute
