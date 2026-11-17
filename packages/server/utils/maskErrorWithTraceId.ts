import {GraphQLError} from 'graphql'
import {maskError} from 'graphql-yoga'

// yoga masks errors after the operation's log context has closed, so useErrorLogging hands over each failure's trace id
const traceIdByError = new WeakMap<object, string>()

export const rememberTraceId = (error: Error, traceId: string) => {
  traceIdByError.set(error, traceId)
}

const maskErrorWithTraceId: typeof maskError = (error, message, isDev) => {
  const maskedError = maskError(error, message, isDev)
  const traceId = error instanceof Error ? traceIdByError.get(error) : undefined
  if (traceId && maskedError instanceof GraphQLError) maskedError.extensions.traceId = traceId
  return maskedError
}

export default maskErrorWithTraceId
