import {HOST, PROTOCOL, sendPublic, signUp} from './common'

export const MCP_URL = `${PROTOCOL}://${HOST}/mcp`
export const PROTOCOL_VERSION = '2025-06-18'

export const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
  ) {
    createPersonalAccessToken(
      name: $name
      scopes: $scopes
      expiresAt: $expiresAt
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
    ) {
      token
    }
  }
`

export const postMCP = (body: unknown, headers: Record<string, string> = {}) =>
  fetch(MCP_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  })

export const bearer = (token: string) => ({authorization: `Bearer ${token}`})

interface TokenOptions {
  cookie?: string
  grantedOrgIds?: string[]
  grantedTeamIds?: string[]
  grantedPageIds?: string[]
}

export const createPersonalAccessToken = async (
  scopes = ['USERS_READ'],
  {cookie, ...grants}: TokenOptions = {}
) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'mcp',
      scopes,
      ...grants,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie: cookie ?? (await signUp()).cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

export const callTool = async (token: string, name: string, args: Record<string, unknown>) => {
  const response = await postMCP(
    {jsonrpc: '2.0', id: 2, method: 'tools/call', params: {name, arguments: args}},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect(response.status).toBe(200)
  return (await response.json()).result as {
    isError?: boolean
    content: {type: string; text: string}[]
  }
}

export const callToolForData = async (
  token: string,
  name: string,
  args: Record<string, unknown>
) => {
  const result = await callTool(token, name, args)
  expect(result.isError ? `${name}: ${result.content[0]!.text}` : undefined).toBeUndefined()
  return JSON.parse(result.content[0]!.text)
}

export const expectToolError = (result: Awaited<ReturnType<typeof callTool>>, text: string) => {
  expect(result.isError).toBe(true)
  expect(result.content[0]!.text).toContain(text)
}

export const expectToolErrorCode = (result: Awaited<ReturnType<typeof callTool>>, code: string) => {
  expect(result.isError).toBe(true)
  const [error] = JSON.parse(result.content[0]!.text)
  expect(error.code).toBe(code)
  return error.message as string
}

export const listTools = async (token: string) => {
  const response = await postMCP(
    {jsonrpc: '2.0', id: 3, method: 'tools/list'},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect(response.status).toBe(200)
  return (await response.json()).result.tools
}
