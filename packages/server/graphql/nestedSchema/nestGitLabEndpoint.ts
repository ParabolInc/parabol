import {GraphQLObjectType, GraphQLResolveInfo, OperationDefinitionNode, parse, print} from 'graphql'
import nestGraphQLEndpoint from 'nest-graphql-endpoint/lib/nestGraphQLEndpoint'
import {
  EndpointExecutionResult,
  Executor,
  NestedSource,
  NestGraphQLEndpointParams
} from 'nest-graphql-endpoint/lib/types'
import fetch from 'node-fetch'

const defaultExecutor: Executor<{
  accessToken: string
  baseUri?: string
  headers?: Record<string, string>
}> = async (document, variables, endpointTimeout, context) => {
  const controller = new AbortController()
  const {signal} = controller
  const {accessToken, baseUri, headers} = context
  const timeout = setTimeout(() => {
    controller.abort()
  }, endpointTimeout)
  try {
    const result = await fetch(`${baseUri}/api/graphql`, {
      signal: signal as any,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        ...headers
      },
      body: JSON.stringify({
        query: print(document),
        variables
      })
    })
    clearTimeout(timeout)
    const resJSON = (await result.json()) as EndpointExecutionResult | {message?: string}
    if ('data' in resJSON || 'errors' in resJSON) return resJSON
    const message = String(resJSON.message) || JSON.stringify(resJSON)
    return {
      errors: [
        {
          type: 'GitLab Gateway Error',
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
          type: 'GitLab is down',
          message: String((e as any).message)
        }
      ],
      data: null
    }
  }
}

type NestParams = NestGraphQLEndpointParams<{
  accessToken: string
  baseUri: string
  headers?: Record<string, string>
}>
type RequiredParams = Pick<
  NestParams,
  'parentSchema' | 'parentType' | 'fieldName' | 'resolveEndpointContext' | 'schemaIDL'
>

type OptionalParams = Omit<Partial<NestParams>, keyof RequiredParams>
type NestGitLabParams = RequiredParams & OptionalParams

interface Input<TVars> {
  query: string
  endpointContext: Record<string, any>
  info: GraphQLResolveInfo
  // only necessary if the query needs them
  variables?: TVars
  //to reuse a dataloader, pass in your execution context object
  batchRef?: Record<any, any>
}
const nestGitLabEndpoint = (params: NestGitLabParams) => {
  const {parentSchema, parentType, fieldName, resolveEndpointContext} = params
  const executor = params.executor || defaultExecutor
  const prefix = params.prefix || '_extGitLab'
  const batchKey = params.batchKey || 'accessToken'
  const endpointTimeout = params.endpointTimeout || 8000
  const schemaIDL = params.schemaIDL
  const gitlabRequest = async <TData = any, TVars = any>(input: Input<TVars>) => {
    const {query, endpointContext, variables, batchRef, info} = input
    const {schema} = info
    const gitlabApi = schema.getType(`${prefix}Api`) as GraphQLObjectType
    const fields = gitlabApi.getFields()
    const wrapperAST = parse(query)
    const {definitions} = wrapperAST
    const [firstDefinition] = definitions
    const {operation} = firstDefinition as OperationDefinitionNode
    const rootOperation = fields[operation]
    if (!rootOperation) throw new Error(`Unsupported operation: ${operation}`)
    const resolve = rootOperation.resolve!
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

  const nestedSchema = nestGraphQLEndpoint({
    parentSchema,
    parentType,
    fieldName,
    resolveEndpointContext,
    executor,
    prefix,
    batchKey,
    endpointTimeout,
    schemaIDL
  })

  return {schema: nestedSchema, gitlabRequest}
}

export default nestGitLabEndpoint
