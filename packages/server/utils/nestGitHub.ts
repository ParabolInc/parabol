import {print} from 'graphql'
import nestGraphQLEndpoint, {
  type EndpointExecutionResult,
  type Executor
} from 'nest-graphql-endpoint'
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

export const nestGitHub = () =>
  nestGraphQLEndpoint({
    parentType: 'GitHubIntegration',
    fieldName: 'api',
    executor,
    resolveEndpointContext: ({accessToken}: {accessToken: string}) => ({
      accessToken,
      headers: {Accept: 'application/vnd.github.bane-preview+json'}
    }),
    prefix: '_xGitHub',
    schemaIDL: githubSchema,
    endpointTimeout: 8000
  })
