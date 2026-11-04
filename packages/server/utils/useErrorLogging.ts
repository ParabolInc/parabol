import {
  handleStreamOrSingleExecutionResult,
  isAsyncIterable,
  isOriginalGraphQLError,
  type TypedExecutionArgs
} from '@envelop/core'
import {
  BREAK,
  type DocumentNode,
  GraphQLError,
  type GraphQLSchema,
  getOperationAST,
  TypeInfo,
  visit,
  visitWithTypeInfo
} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import {unexpectedGraphQLErrors} from '../metricsHandler'
import getOperationSpan from '../tracing/getOperationSpan'
import getSpanLogContext from '../tracing/getSpanLogContext'
import type {ServerContext} from '../yoga'
import getTraceLogContext from './getTraceLogContext'
import {type GraphQLLogContext, Logger, markErrorAsLogged} from './Logger'
import {createLogContext, enterLogContext, type RequestLogContext} from './requestLogContext'

type LoggableContext = Partial<
  Pick<
    ServerContext,
    'authToken' | 'ip' | 'traceparent' | 'sessionId' | 'socketId' | 'clientVersion'
  >
>

const getOperationLogContext = (args: TypedExecutionArgs<LoggableContext>): RequestLogContext => {
  const operation = getOperationAST(args.document, args.operationName)
  const {authToken, ip, traceparent, sessionId, socketId, clientVersion} = args.contextValue
  const operationSpan = getOperationSpan(args)
  return createLogContext({
    userId: authToken?.sub,
    ip,
    sessionId,
    socketId,
    clientVersion,
    component: 'graphql',
    operationName: operation?.name?.value ?? args.operationName ?? 'anonymous',
    operationKind: operation?.operation,
    variables: args.variableValues ?? undefined,
    ...(operationSpan
      ? getSpanLogContext(operationSpan.spanContext())
      : getTraceLogContext(traceparent))
  })
}

interface ExecutedDocument {
  schema: GraphQLSchema
  document: DocumentNode
}

// the parent type and field of the selection that failed, e.g. Team.teamLead for the path viewer.team.teamLead
const getFailedField = ({schema, document}: ExecutedDocument, error: GraphQLError) => {
  const failedNode = error.nodes?.[0]
  if (!failedNode) return undefined
  const typeInfo = new TypeInfo(schema)
  let failedField: string | undefined
  visit(
    document,
    visitWithTypeInfo(typeInfo, {
      Field(node) {
        if (node !== failedNode) return undefined
        const parentType = typeInfo.getParentType()
        failedField = parentType ? `${parentType.name}.${node.name.value}` : undefined
        return BREAK
      }
    })
  )
  return failedField
}

const getGraphQLLogContext = (
  executedDocument: ExecutedDocument,
  error: GraphQLError
): GraphQLLogContext | undefined => {
  if (!error.path) return undefined
  const field = getFailedField(executedDocument, error)
  return {path: error.path.join('.'), ...(field && {field})}
}

const logResultErrors = (
  executedDocument: ExecutedDocument,
  errors: readonly GraphQLError[] | undefined
) => {
  let hasUnexpectedError = false
  errors?.forEach((error) => {
    const graphql = getGraphQLLogContext(executedDocument, error)
    const loggableError = error.originalError ?? error
    if (isOriginalGraphQLError(error)) {
      Logger.warn(loggableError, {graphql})
    } else {
      hasUnexpectedError = true
      Logger.error(loggableError, {graphql})
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
    next: () => enterLogContext(logContext, () => iterator.next()),
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
    setExecuteFn((executeArgs) => enterLogContext(logContext, () => executeFn(executeArgs)))
    // a deferred or streamed operation returns several results but is one request to the availability SLO
    let isCountedAsFailed = false
    return {
      onExecuteDone(payload) {
        return handleStreamOrSingleExecutionResult(payload, ({result}) => {
          const hasUnexpectedError = enterLogContext(logContext, () =>
            logResultErrors(args, result.errors)
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
      const result = await enterLogContext(logContext, () => subscribeFn(subscribeArgs))
      return isAsyncIterable(result) ? pullEventsInLogContext(result, logContext) : result
    })
    return {
      onSubscribeError({error}) {
        enterLogContext(logContext, () => {
          if (error instanceof GraphQLError) {
            logResultErrors(args, [error])
          } else {
            Logger.error(error instanceof Error ? error : new Error(String(error)))
          }
        })
      },
      onSubscribeResult() {
        return {
          onNext({result}) {
            enterLogContext(logContext, () => logResultErrors(args, result.errors))
          }
        }
      }
    }
  }
})
