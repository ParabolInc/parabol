import type {PayloadError} from 'relay-runtime'
import GraphQLServerError, {type GraphQLErrorCode} from './GraphQLServerError'

export interface MutationError {
  message: string
  code?: GraphQLErrorCode
}

// a payload's userErrors, a legacy payload's error, or the ErrorPayload arm of a union sits on the mutation's field
const getPayloadErrorMessage = (response: unknown): string | undefined => {
  if (!response || typeof response !== 'object') return undefined
  for (const fieldValue of Object.values(response)) {
    const userErrorMessage = fieldValue?.userErrors?.[0]?.message
    if (typeof userErrorMessage === 'string') return userErrorMessage
    const errorMessage = fieldValue?.error?.message
    if (typeof errorMessage === 'string') return errorMessage
  }
  return undefined
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
