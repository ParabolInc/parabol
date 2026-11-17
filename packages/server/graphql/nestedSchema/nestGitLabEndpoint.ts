import {fetch} from '@whatwg-node/fetch'
import {print} from 'graphql'
import nestGraphQLEndpoint, {
  type EndpointExecutionResult,
  type Executor,
  type NestGraphQLEndpointParams
} from 'nest-graphql-endpoint'
import {PROVIDER_UNAVAILABLE} from '../../integrations/platform/toNestedRequestError'

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
    if ('errors' in resJSON || 'data' in resJSON) return resJSON
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
  baseUri: string
  headers?: Record<string, string>
}>
type RequiredParams = Pick<
  NestParams,
  'parentType' | 'fieldName' | 'resolveEndpointContext' | 'schemaIDL'
>
type OptionalParams = Omit<Partial<NestParams>, keyof RequiredParams>

const nestGitLabEndpoint = (params: RequiredParams & OptionalParams) =>
  nestGraphQLEndpoint({
    executor: defaultExecutor,
    prefix: '_extGitLab',
    batchKey: 'accessToken',
    endpointTimeout: 8000,
    ...params
  })

export default nestGitLabEndpoint
