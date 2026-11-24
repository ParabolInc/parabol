import type {FormattedExecutionResult} from 'graphql'
import {MCP_RESOURCE} from '../oauth2/validateOAuthAuthorizationRequest'
import {yoga} from '../yoga'
import type {MCPContext} from './MCPContext'

const toMultipartBody = (
  {variables, ...operation}: {variables?: Record<string, unknown>},
  files: Record<string, File>
) => {
  const entries = Object.entries(files)
  const nullFiles = Object.fromEntries(entries.map(([name]) => [name, null]))
  const body = new FormData()
  body.append('operations', JSON.stringify({...operation, variables: {...variables, ...nullFiles}}))
  body.append(
    'map',
    JSON.stringify(Object.fromEntries(entries.map(([name], idx) => [idx, [`variables.${name}`]])))
  )
  entries.forEach(([, file], idx) => {
    body.append(String(idx), file)
  })
  return body
}

// yoga sends extensions.http as response headers and drops it from the body, so restore Retry-After
const withRetryAfter = <TData>(
  result: FormattedExecutionResult<TData>,
  retryAfter: string | null
): FormattedExecutionResult<TData> => {
  if (!retryAfter || !result.errors) return result
  return {
    ...result,
    errors: result.errors.map((error) =>
      error.extensions?.code === 'TOO_MANY_REQUESTS'
        ? {
            ...error,
            extensions: {...error.extensions, http: {headers: {'Retry-After': retryAfter}}}
          }
        : error
    )
  }
}

const runGraphQL = async <TData = Record<string, unknown>>(
  {authorization, ip}: Pick<MCPContext, 'authorization' | 'ip'>,
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string,
  files?: Record<string, File>
): Promise<FormattedExecutionResult<TData>> => {
  const operations = {query, variables, operationName}
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization,
        ...(!files && {'content-type': 'application/json'})
      },
      body: files ? toMultipartBody(operations, files) : JSON.stringify(operations)
    },
    {authToken: null, ip, expectedResource: MCP_RESOURCE}
  )
  return withRetryAfter<TData>(await response.json(), response.headers.get('retry-after'))
}

export default runGraphQL
