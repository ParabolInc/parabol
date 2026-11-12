import type {PayloadError} from 'relay-runtime'
import GraphQLServerError, {type GraphQLErrorCode} from './GraphQLServerError'

export interface MutationError {
  message: string
  code?: GraphQLErrorCode
}

// a legacy payload, or the ErrorPayload arm of a union, puts the error on the mutation's field
const getPayloadErrorMessage = (response: unknown): string | undefined => {
  if (!response || typeof response !== 'object') return undefined
  const payload = Object.values(response).find(
    (fieldValue) => typeof fieldValue?.error?.message === 'string'
  )
  return payload?.error.message
}

function getMutationError(error: Error): MutationError
function getMutationError(
  response: unknown,
  errors: readonly PayloadError[] | null | undefined
): MutationError | undefined
function getMutationError(responseOrError: unknown, errors?: readonly PayloadError[] | null) {
  if (responseOrError instanceof Error) {
    const code = responseOrError instanceof GraphQLServerError ? responseOrError.code : undefined
    return {message: responseOrError.message, code}
  }
  const payloadErrorMessage = getPayloadErrorMessage(responseOrError)
  if (payloadErrorMessage) return {message: payloadErrorMessage}
  const firstError = errors?.[0]
  return firstError ? {message: firstError.message, code: firstError.extensions?.code} : undefined
}

export default getMutationError
