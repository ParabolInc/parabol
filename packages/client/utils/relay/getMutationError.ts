import type {PayloadError} from 'relay-runtime'
import GraphQLServerError, {type GraphQLErrorCode} from './GraphQLServerError'

export interface MutationError {
  message: string
  code?: GraphQLErrorCode
}

function getMutationError(error: Error): MutationError
function getMutationError(
  response: unknown,
  errors: readonly PayloadError[] | null | undefined
): MutationError | undefined
function getMutationError(
  responseOrError: unknown,
  errors?: readonly PayloadError[] | null
): MutationError | undefined {
  if (responseOrError instanceof Error) {
    const code = responseOrError instanceof GraphQLServerError ? responseOrError.code : undefined
    return {message: responseOrError.message, code}
  }
  const firstError = errors?.[0]
  return firstError ? {message: firstError.message, code: firstError.extensions?.code} : undefined
}

export default getMutationError
