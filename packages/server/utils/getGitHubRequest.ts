import {GraphQLResolveInfo} from 'graphql'
import {EndpointContext} from 'nest-graphql-endpoint/lib/types'
import {githubRequest} from '../graphql/public/rootSchema'

// This helper just cleans up the input/output boilerplate.
// It breaks githubRequest into 2 parts so the info, endpointContext, and batchRef are kept in context
// It also returns a tuple, and an Error of the first error message
// Not necessary to use this, but it helps keep code looking clean

const getGitHubRequest = (
  info: GraphQLResolveInfo,
  batchRef: Record<any, any>,
  endpointContext: EndpointContext
) => {
  return async <TData = any, TVars = any>(query: string, variables?: TVars) => {
    const result = await githubRequest<TData, TVars>({
      query,
      variables,
      info,
      endpointContext,
      batchRef
    })
    const {data, errors} = result
    const error = errors ? new Error(errors[0]?.message) : null
    return [data, error] as [TData, typeof error]
  }
}

export default getGitHubRequest
