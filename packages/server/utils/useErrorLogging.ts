import {
  handleStreamOrSingleExecutionResult,
  isAsyncIterable,
  isOriginalGraphQLError,
  type TypedExecutionArgs
} from '@envelop/core'
import {GraphQLError, getOperationAST} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import {unexpectedGraphQLErrors} from '../metricsHandler'
import getOperationSpan from '../tracing/getOperationSpan'
import getSpanLogContext from '../tracing/getSpanLogContext'
import type {ServerContext} from '../yoga'
import getTraceLogContext from './getTraceLogContext'
import {Logger, markErrorAsLogged} from './Logger'
import {type RequestLogContext, runWithLogContext} from './requestLogContext'

type LoggableContext = Partial<
  Pick<ServerContext, 'authToken' | 'ip' | 'traceparent' | 'sessionId' | 'socketId'>
>

const getOperationLogContext = (args: TypedExecutionArgs<LoggableContext>): RequestLogContext => {
  const operation = getOperationAST(args.document, args.operationName)
  const {authToken, ip, traceparent, sessionId, socketId} = args.contextValue
  const operationSpan = getOperationSpan(args)
  return {
    userId: authToken?.sub,
    ip,
    sessionId,
    socketId,
    component: 'graphql',
    operationName: operation?.name?.value ?? args.operationName ?? 'anonymous',
    operationKind: operation?.operation,
    variables: args.variableValues ?? undefined,
    ...(operationSpan
      ? getSpanLogContext(operationSpan.spanContext())
      : getTraceLogContext(traceparent))
  }
}

const logResultErrors = (errors: readonly GraphQLError[] | undefined) => {
  let hasUnexpectedError = false
  errors?.forEach((error) => {
    const extras = error.path ? {path: error.path.join('.')} : undefined
    const loggableError = error.originalError ?? error
    if (isOriginalGraphQLError(error)) {
      Logger.warn(loggableError, {extras})
    } else {
      hasUnexpectedError = true
      Logger.error(loggableError, {extras})
    }
    // yoga's maskedErrors passes the GraphQLError wrapper to Logger.error next; suppress that duplicate
    markErrorAsLogged(error)
  })
  return hasUnexpectedError
}

// graphql-ws and yoga's SSE pull each event from their own loop, outside the operation's log context,
// and the event's resolvers run inside that pull, so every pull re-enters the context
const pullEventsInLogContext = <T>(
  events: AsyncIterable<T>,
  logContext: RequestLogContext
): AsyncIterableIterator<T> => {
  const iterator = events[Symbol.asyncIterator]()
  return {
    next: () => runWithLogContext(logContext, () => iterator.next()),
    return: (value?: unknown) => iterator.return?.(value) ?? Promise.resolve({done: true, value}),
    throw: (error?: unknown) => iterator.throw?.(error) ?? Promise.reject(error),
    [Symbol.asyncIterator]() {
      return this
    }
  }
}

export const useErrorLogging = (): Plugin<LoggableContext> => ({
  onExecute({args, executeFn, setExecuteFn}) {
    const logContext = getOperationLogContext(args)
    setExecuteFn((executeArgs) => runWithLogContext(logContext, () => executeFn(executeArgs)))
    // a deferred or streamed operation returns several results but is one request to the availability SLO
    let isCountedAsFailed = false
    return {
      onExecuteDone(payload) {
        return handleStreamOrSingleExecutionResult(payload, ({result}) => {
          const hasUnexpectedError = runWithLogContext(logContext, () =>
            logResultErrors(result.errors)
          )
          if (hasUnexpectedError && !isCountedAsFailed) {
            isCountedAsFailed = true
            unexpectedGraphQLErrors.inc({operation_type: logContext.operationKind ?? 'unknown'})
          }
        })
      }
    }
  },
  onSubscribe({args, subscribeFn, setSubscribeFn}) {
    const logContext = getOperationLogContext(args)
    setSubscribeFn(async (subscribeArgs) => {
      const result = await runWithLogContext(logContext, () => subscribeFn(subscribeArgs))
      return isAsyncIterable(result) ? pullEventsInLogContext(result, logContext) : result
    })
    return {
      onSubscribeError({error}) {
        runWithLogContext(logContext, () => {
          if (error instanceof GraphQLError) {
            logResultErrors([error])
          } else {
            Logger.error(error instanceof Error ? error : new Error(String(error)))
          }
        })
      },
      onSubscribeResult() {
        return {
          onNext({result}) {
            runWithLogContext(logContext, () => logResultErrors(result.errors))
          }
        }
      }
    }
  }
})
