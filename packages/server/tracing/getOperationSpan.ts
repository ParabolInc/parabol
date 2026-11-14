import type {TypedExecutionArgs} from '@envelop/core'
import {ROOT_CONTEXT, type Span, SpanKind, TraceFlags, trace} from '@opentelemetry/api'
import {getOperationAST} from 'graphql'
import {parseTraceparent} from '../utils/getTraceLogContext'
import type {ServerContext} from '../yoga'
import {TRACING_ENABLED} from './initTracing'
import tracer from './tracer'

export type TracedContext = Partial<Pick<ServerContext, 'authToken' | 'traceparent' | 'sessionId'>>

const getRemoteParentContext = (traceparent: string | undefined) => {
  const remoteParent = parseTraceparent(traceparent)
  if (!remoteParent) return ROOT_CONTEXT
  return trace.setSpanContext(ROOT_CONTEXT, {
    traceId: remoteParent.traceId,
    spanId: remoteParent.parentSpanId,
    traceFlags: remoteParent.sampled ? TraceFlags.SAMPLED : TraceFlags.NONE,
    isRemote: true
  })
}

// the tracing and error logging plugins both need the operation's span, so whichever asks first starts it
const operationSpans = new WeakMap<object, Span>()

const getOperationSpan = (args: TypedExecutionArgs<TracedContext>) => {
  if (!TRACING_ENABLED) return undefined
  const {contextValue} = args
  const existingSpan = operationSpans.get(contextValue)
  if (existingSpan) return existingSpan
  const {authToken, sessionId, traceparent} = contextValue
  const operation = getOperationAST(args.document, args.operationName)
  const operationName = operation?.name?.value ?? args.operationName ?? 'anonymous'
  const operationType = operation?.operation ?? 'query'
  const span = tracer.startSpan(
    `${operationType} ${operationName}`,
    {
      kind: SpanKind.SERVER,
      attributes: {
        'graphql.operation.name': operationName,
        'graphql.operation.type': operationType,
        ...(authToken?.sub && {'user.id': authToken.sub}),
        ...(sessionId && {'session.id': sessionId})
      }
    },
    getRemoteParentContext(traceparent)
  )
  operationSpans.set(contextValue, span)
  return span
}

export default getOperationSpan
