import {
  handleStreamOrSingleExecutionResult,
  isOriginalGraphQLError,
  type TypedExecutionArgs
} from '@envelop/core'
import {GraphQLError, getOperationAST} from 'graphql'
import type {Plugin} from 'graphql-yoga'
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
  return {
    userId: authToken?.sub,
    ip,
    sessionId,
    socketId,
    component: 'graphql',
    operationName: operation?.name?.value ?? args.operationName ?? 'anonymous',
    operationKind: operation?.operation,
    variables: args.variableValues ?? undefined,
    ...getTraceLogContext(traceparent)
  }
}

const logResultErrors = (errors: readonly GraphQLError[] | undefined) => {
  errors?.forEach((error) => {
    const extras = error.path ? {path: error.path.join('.')} : undefined
    const loggableError = error.originalError ?? error
    if (isOriginalGraphQLError(error)) {
      Logger.warn(loggableError, {extras})
    } else {
      Logger.error(loggableError, {extras})
    }
    // yoga's maskedErrors passes the GraphQLError wrapper to Logger.error next; suppress that duplicate
    markErrorAsLogged(error)
  })
}

export const useErrorLogging = (): Plugin<LoggableContext> => ({
  onExecute({args, executeFn, setExecuteFn}) {
    const logContext = getOperationLogContext(args)
    setExecuteFn((executeArgs) => runWithLogContext(logContext, () => executeFn(executeArgs)))
    return {
      onExecuteDone(payload) {
        return handleStreamOrSingleExecutionResult(payload, ({result}) => {
          runWithLogContext(logContext, () => logResultErrors(result.errors))
        })
      }
    }
  },
  onSubscribe({args, subscribeFn, setSubscribeFn}) {
    const logContext = getOperationLogContext(args)
    setSubscribeFn((subscribeArgs) =>
      runWithLogContext(logContext, () => subscribeFn(subscribeArgs))
    )
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
