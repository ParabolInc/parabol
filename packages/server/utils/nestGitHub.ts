import {
  type GraphQLObjectType,
  type GraphQLResolveInfo,
  type OperationDefinitionNode,
  parse,
  print
} from 'graphql'
import type {EndpointExecutionResult, Executor, NestedSource} from 'nest-graphql-endpoint/lib/types'
import {nestGraphQLEndpoint} from '../graphql/nestedSchema/nestGraphQLEndpoint'
import githubSchema from './githubSchema.graphql'

// Resolvers from SDL first definitions

const executor: Executor<{accessToken: string; headers?: Record<string, string>}> = async (
  document,
  variables,
  endpointTimeout,
  context
) => {
  const controller = new AbortController()
  const {signal} = controller
  const {accessToken, headers} = context
  const timeout = setTimeout(() => {
    controller.abort()
  }, endpointTimeout)
  try {
    const result = await fetch('https://api.github.com/graphql', {
      signal: signal as any,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'User-Agent': 'parabol', // this is not supplied in the defaultExecutor
        ...headers
      },
      body: JSON.stringify({
        query: print(document),
        variables
      })
    })
    clearTimeout(timeout)
    const resJSON = (await result.json()) as EndpointExecutionResult | {message?: string}
    if ('data' in resJSON) return resJSON
    const message = String(resJSON.message) || JSON.stringify(resJSON)
    return {
      errors: [
        {
          type: 'GitHub Gateway Error',
          message
        }
      ],
      data: null
    }
  } catch (e) {
    clearTimeout(timeout)
    return {
      errors: [
        {
          type: 'GitHub is down',
          message: String((e as any).message)
        }
      ],
      data: null
    }
  }
}

const prefix = '_xGitHub'

interface Input<TVars> {
  query: string
  endpointContext: Record<string, any>
  info: GraphQLResolveInfo
  variables?: TVars
  batchRef?: Record<any, any>
}

const githubRequest = async <TData = any, TVars = any>(input: Input<TVars>) => {
  const {query, endpointContext, variables, batchRef, info} = input
  const {schema} = info
  const githubApi = schema.getType(`${prefix}Api`) as GraphQLObjectType
  const fields = githubApi.getFields()
  const wrapperAST = parse(query)
  const {definitions} = wrapperAST
  const [firstDefinition] = definitions
  const {operation} = firstDefinition as OperationDefinitionNode
  const resolve = fields[operation]!.resolve!
  const source = {
    context: endpointContext,
    wrapper: wrapperAST,
    wrapperVars: variables
  } as NestedSource<any>
  const context = batchRef ?? {}
  const data = (await resolve(source, {}, context, info)) as TData
  const {errors} = source
  return {data, errors}
}

export const nestGitHub = () => ({
  endpoint: nestGraphQLEndpoint({
    parentType: 'GitHubIntegration',
    fieldName: 'api',
    executor,
    resolveEndpointContext: ({accessToken}: {accessToken: string}) => ({
      accessToken,
      headers: {Accept: 'application/vnd.github.bane-preview+json'}
    }),
    prefix,
    schemaIDL: githubSchema,
    endpointTimeout: 8000
  }),
  githubRequest
})
