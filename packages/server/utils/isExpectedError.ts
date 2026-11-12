import {GraphQLError} from 'graphql'

const isExpectedError = (error: unknown): boolean =>
  error instanceof GraphQLError &&
  error.extensions.code !== 'INTERNAL_SERVER_ERROR' &&
  (!error.originalError || isExpectedError(error.originalError))

export default isExpectedError
