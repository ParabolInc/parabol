import {GraphQLObjectType, GraphQLResolveInfo, OperationDefinitionNode, parse, print} from 'graphql'
import nestGraphQLEndpoint from 'nest-graphql-endpoint/lib/nestGraphQLEndpoint'
import {
  EndpointExecutionResult,
  Executor,
  NestGraphQLEndpointParams,
  NestedSource
} from 'nest-graphql-endpoint/lib/types'
import {URL} from 'url'

const defaultExecutor: Executor<{
  accessToken: string
  baseUri?: string
  headers?: Record<string, string>
}> = async (document, variables, endpointTimeout, context) => {
  const controller = new AbortController()
  const {accessToken, baseUri, headers} = context
  const url = new URL(baseUri ?? 'https://linear.app')
  // We assume the baseUri handed to us contains the hostname used
  // for authentication. We must modify this to become the API
  // endpoint
  const apiHostname = `api.${url.hostname}`
  const apiEndpoint = `${url.protocol}//${apiHostname}/graphql`
  const timeout = setTimeout(() => {
    controller.abort()
  }, endpointTimeout)
  try {
    const result = await fetch(apiEndpoint, {
      signal: AbortSignal.timeout(endpointTimeout),
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
    // Ensure the returned object and its nested properties have standard prototypes
    const processedRes = {...resJSON}
    if ('errors' in processedRes || 'data' in processedRes) return processedRes
    const message = String(processedRes.message) || JSON.stringify(processedRes)
    return {
      errors: [
        {
          type: 'Linear Gateway Error',
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
          type: 'Linear is down',
          message: String((e as any).message)
        }
      ],
      data: null
    }
  }
}
type NestParams = NestGraphQLEndpointParams<{
  accessToken: string
  headers?: Record<string, string>
}>
type RequiredParams = Pick<
  NestParams,
  'parentSchema' | 'parentType' | 'fieldName' | 'resolveEndpointContext' | 'schemaIDL'
>

type OptionalParams = Omit<Partial<NestParams>, keyof RequiredParams>
type NestLinearParams = RequiredParams & OptionalParams

interface Input<TVars> {
  query: string
  endpointContext: Record<string, any>
  info: GraphQLResolveInfo
  // only necessary if the query needs them
  variables?: TVars
  //to reuse a dataloader, pass in your execution context object
  batchRef?: Record<any, any>
}
const nestLinearEndpoint = (params: NestLinearParams) => {
  const {parentSchema, parentType, fieldName, resolveEndpointContext} = params
  const executor = params.executor || defaultExecutor
  const prefix = params.prefix || '_extLinear'
  const batchKey = params.batchKey || 'accessToken'
  const endpointTimeout = params.endpointTimeout || 8000
  const schemaIDL = params.schemaIDL
  const linearRequest = async <TData = any, TVars = any>(input: Input<TVars>) => {
    const {query, endpointContext, variables, batchRef, info} = input
    const {schema} = info
    const linearApi = schema.getType(`${prefix}Api`) as GraphQLObjectType
    const fields = linearApi.getFields()
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

  return {schema: nestedSchema, linearRequest}
}

export default nestLinearEndpoint
