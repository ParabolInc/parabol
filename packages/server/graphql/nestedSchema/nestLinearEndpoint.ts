import {fetch} from '@whatwg-node/fetch'
import {print} from 'graphql'
import nestGraphQLEndpoint, {
  type EndpointExecutionResult,
  type Executor,
  type NestGraphQLEndpointParams
} from 'nest-graphql-endpoint'
import {URL} from 'url'
import {PROVIDER_UNAVAILABLE} from '../../integrations/platform/toNestedRequestError'

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
        'User-Agent': 'parabol',
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
          type: PROVIDER_UNAVAILABLE,
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
  'parentType' | 'fieldName' | 'resolveEndpointContext' | 'schemaIDL'
>
type OptionalParams = Omit<Partial<NestParams>, keyof RequiredParams>

const nestLinearEndpoint = (params: RequiredParams & OptionalParams) =>
  nestGraphQLEndpoint({
    executor: defaultExecutor,
    prefix: '_extLinear',
    batchKey: 'accessToken',
    endpointTimeout: 8000,
    ...params
  })

export default nestLinearEndpoint
