import {isAsyncIterable, isOriginalGraphQLError} from '@envelop/core'
import {context, type Span, SpanStatusCode, trace} from '@opentelemetry/api'
import {
  type ExecutionResult,
  GraphQLError,
  type GraphQLFieldResolver,
  type GraphQLResolveInfo,
  getNamedType,
  isIntrospectionType,
  isLeafType,
  isObjectType
} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import getOperationSpan, {type TracedContext} from './getOperationSpan'
import tracer from './tracer'

const operationTracingKey = Symbol('operationTracing')
const tracedResolverKey = Symbol('tracedResolver')

interface OperationTracing {
  operationSpan: Span
  // keyed by field path with list indexes collapsed, so only the first item of a list gets spans
  fieldSpans: Map<string, Span>
}
type TracingContext = {[operationTracingKey]?: OperationTracing}
type TracedResolver = GraphQLFieldResolver<unknown, TracingContext> & {[tracedResolverKey]?: true}

const recordError = (span: Span, error: unknown) => {
  // an intentional GraphQLError, like NOT_FOUND, is an answer rather than a failure
  if (isOriginalGraphQLError(error)) return
  const exception = error instanceof GraphQLError ? (error.originalError ?? error) : error
  span.recordException(exception instanceof Error ? exception : String(exception))
  span.setStatus({code: SpanStatusCode.ERROR})
}

const getFieldPath = (info: GraphQLResolveInfo) => {
  const fieldPath: string[] = []
  for (let path: GraphQLResolveInfo['path'] | undefined = info.path; path; path = path.prev) {
    fieldPath.unshift(typeof path.key === 'number' ? '*' : path.key)
  }
  return fieldPath
}

const getParentSpan = (fieldPath: string[], {operationSpan, fieldSpans}: OperationTracing) => {
  for (let depth = fieldPath.length - 1; depth > 0; depth--) {
    const parentSpan = fieldSpans.get(fieldPath.slice(0, depth).join('.'))
    if (parentSpan) return parentSpan
  }
  return operationSpan
}

const traceResolver = (
  contextValue: TracingContext,
  info: GraphQLResolveInfo,
  resolve: () => unknown
) => {
  const operationTracing = contextValue[operationTracingKey]
  if (!operationTracing?.operationSpan.isRecording()) return resolve()
  const fieldPath = getFieldPath(info)
  const fieldPathKey = fieldPath.join('.')
  if (operationTracing.fieldSpans.has(fieldPathKey)) return resolve()
  // graphql-js resolves a child field outside its parent's resolver, so the parent comes from the path
  const span = tracer.startSpan(
    `${info.parentType.name}.${info.fieldName}`,
    {attributes: {'graphql.field.path': fieldPathKey}},
    trace.setSpan(context.active(), getParentSpan(fieldPath, operationTracing))
  )
  operationTracing.fieldSpans.set(fieldPathKey, span)
  const endSpan = (result: unknown) => {
    if (result instanceof Error) {
      recordError(span, result)
    }
    span.end()
    return result
  }
  const failSpan = (error: unknown) => {
    recordError(span, error)
    span.end()
    throw error
  }
  return context.with(trace.setSpan(context.active(), span), () => {
    try {
      const result = resolve()
      return result instanceof Promise ? result.then(endSpan, failSpan) : endSpan(result)
    } catch (error) {
      return failSpan(error)
    }
  })
}

export const useTracing = (): Plugin<TracedContext & TracingContext> => ({
  onSchemaChange({schema}) {
    const rootTypes = new Set([schema.getQueryType(), schema.getMutationType()])
    Object.values(schema.getTypeMap()).forEach((type) => {
      if (!isObjectType(type) || isIntrospectionType(type)) return
      const isRootType = rootTypes.has(type)
      Object.values(type.getFields()).forEach((field) => {
        const resolve: TracedResolver | undefined = field.resolve
        if (!resolve || resolve[tracedResolverKey]) return
        // permission rules wrap every field of some types, so a scalar's resolver is usually a check before a property read.
        // A query a scalar does make still shows, under the operation's span
        if (!isRootType && isLeafType(getNamedType(field.type))) return
        // a per-call wrapper, because @envelop/on-resolve's replaceResolver keeps the replacement for later calls
        const tracedResolve: TracedResolver = (source, args, contextValue, info) =>
          traceResolver(contextValue, info, () => resolve(source, args, contextValue, info))
        tracedResolve[tracedResolverKey] = true
        field.resolve = tracedResolve
      })
    })
  },
  onExecute({args, extendContext, executeFn, setExecuteFn}) {
    const operationSpan = getOperationSpan(args)
    if (!operationSpan) return
    extendContext({[operationTracingKey]: {operationSpan, fieldSpans: new Map()}})
    setExecuteFn((executeArgs) =>
      context.with(
        trace.setSpan(context.active(), operationSpan),
        executeFn,
        undefined,
        executeArgs
      )
    )
    return {
      onExecuteDone({result}) {
        if (!isAsyncIterable(result)) {
          result.errors?.forEach((error) => recordError(operationSpan, error))
          operationSpan.end()
          return
        }
        return {
          onNext({result: nextResult}) {
            nextResult.errors?.forEach((error) => recordError(operationSpan, error))
          },
          onEnd() {
            operationSpan.end()
          }
        }
      }
    }
  },
  onSubscribe({args, subscribeFn, setSubscribeFn}) {
    const operationSpan = getOperationSpan(args)
    if (!operationSpan) return
    // the span covers starting the subscription, not the events that follow for as long as the socket lives
    setSubscribeFn(async (subscribeArgs) => {
      try {
        const result: AsyncIterable<ExecutionResult> | ExecutionResult = await context.with(
          trace.setSpan(context.active(), operationSpan),
          subscribeFn,
          undefined,
          subscribeArgs
        )
        if (!isAsyncIterable(result)) {
          result.errors?.forEach((error) => recordError(operationSpan, error))
        }
        return result
      } catch (error) {
        recordError(operationSpan, error)
        throw error
      } finally {
        operationSpan.end()
      }
    })
  }
})
