import {GraphQLError} from 'graphql'
import type {BaseGraphQLError} from 'nest-graphql-endpoint'

/** The type a nested endpoint's executor gives the error when the provider did not answer */
export const PROVIDER_UNAVAILABLE = 'provider unavailable'

/** The provider refused the request for what it names or who sent it, e.g. an issue that was deleted */
export class NestedRequestRefusedError extends Error {}

interface NestedRequestError extends BaseGraphQLError {
  type?: string
  extensions?: {userError?: unknown}
}

/** The first error a nested GitHub, GitLab or Linear request returned */
const toNestedRequestError = (errors: readonly NestedRequestError[] | null | undefined) => {
  const [error] = errors ?? []
  if (!error) return null
  const {message, type, extensions} = error
  if (type === PROVIDER_UNAVAILABLE) {
    return new GraphQLError(message, {extensions: {code: 'SERVICE_UNAVAILABLE'}})
  }
  // Linear's flag for an error the request caused, like an id that no longer resolves
  if (extensions?.userError === true) return new NestedRequestRefusedError(message)
  return new Error(message)
}

export default toNestedRequestError
