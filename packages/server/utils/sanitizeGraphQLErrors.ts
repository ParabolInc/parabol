import {ExecutionResult, GraphQLError} from 'graphql'
import {ExecutionResultDataDefault} from 'graphql/execution/execute'

const sanitizeGraphQLErrors = <T = ExecutionResultDataDefault>(res: ExecutionResult<T>) => {
  if (!Array.isArray(res.errors)) return res
  const sanitizedErrors = res.errors.map((error: GraphQLError) => ({
    message: 'Server error',
    path: error.path
  }))
  return {
    ...res,
    errors: sanitizedErrors
  }
}

export default sanitizeGraphQLErrors
