import type {ExecutionResult} from 'graphql'
import {MCP_RESOURCE} from '../oauth2/validateOAuthAuthorizationRequest'
import {yoga} from '../yoga'
import type {MCPContext} from './MCPContext'

const runGraphQL = async (
  {authorization, ip}: Pick<MCPContext, 'authorization' | 'ip'>,
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string
): Promise<ExecutionResult> => {
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json', authorization},
      body: JSON.stringify({query, variables, operationName})
    },
    {authToken: null, ip, expectedResource: MCP_RESOURCE}
  )
  return response.json()
}

export default runGraphQL
