import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import packageJSON from '../package.json'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {HOST, PROTOCOL, sendPublic, signUp} from './common'
import {createClient, createCode, createPKCEPair} from './oauthClient'

const ORIGIN = `${PROTOCOL}://${HOST}`
const MCP_URL = `${ORIGIN}/mcp`
const PROTOCOL_VERSION = '2025-06-18'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const INITIALIZE = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: {name: 'mcpServer.test', version: '1.0.0'}
  }
}

const postMCP = (body: unknown, headers: Record<string, string> = {}) =>
  fetch(MCP_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  })

const bearer = (token: string) => ({authorization: `Bearer ${token}`})

const createPersonalAccessToken = async (scopes = ['USERS_READ']) => {
  const {cookie} = await signUp()
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'mcp',
      scopes,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const createOAuthAccessToken = async (resource?: string) => {
  const [{cookie}, {clientId, redirectUri}] = await Promise.all([signUp(), createClient()])
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const authorized = await createCode(
    {clientId, redirectUri, scope: 'users:read', codeChallenge, resource},
    cookie
  )
  expect(authorized.errors).toBeUndefined()
  const code = new URL(authorized.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
  const response = await fetch(`${ORIGIN}/oauth/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
      ...(resource && {resource})
    })
  })
  expect(response.status).toBe(200)
  return (await response.json()).access_token as string
}

const callTool = async (token: string, name: string, args: Record<string, unknown>) => {
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

const expectToolError = (result: Awaited<ReturnType<typeof callTool>>, text: string) => {
  expect(result.isError).toBe(true)
  expect(result.content[0]!.text).toContain(text)
}

const expectUnauthorized = (response: Response) => {
  expect(response.status).toBe(401)
  expect(response.headers.get('www-authenticate')).toBe(
    `Bearer resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource/mcp", scope="${Object.values(OAuthScopeEnum).join(' ')}"`
  )
  expect(response.headers.get('access-control-allow-origin')).toBe('*')
  expect(response.headers.get('access-control-expose-headers')).toBe('www-authenticate')
}

const expectInitialized = async (response: Response) => {
  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body).toMatchObject({
    jsonrpc: '2.0',
    id: 1,
    result: {
      protocolVersion: PROTOCOL_VERSION,
      serverInfo: {name: 'parabol', version: packageJSON.version}
    }
  })
  const {instructions} = body.result
  expect(instructions.length).toBeLessThan(2000)
  for (const scope of Object.values(OAuthScopeEnum)) {
    expect(instructions).toContain(scope)
  }
  for (const tool of [
    'read_page',
    'edit_page',
    'search_schema',
    'describe_type',
    'graphql_query',
    'graphql_mutate'
  ]) {
    expect(instructions).toContain(tool)
  }
}

test('no token answers 401 with the resource metadata address and scopes', async () => {
  const response = await postMCP(INITIALIZE)
  expectUnauthorized(response)
})

test('a session cookie alone is refused', async () => {
  const {cookie} = await signUp()
  const response = await postMCP(INITIALIZE, {cookie})
  expectUnauthorized(response)
})

test('a session token sent as a bearer is refused', async () => {
  const {cookie} = await signUp()
  const sessionToken = cookie.split(';')[0]!.split('=').slice(1).join('=')
  const response = await postMCP(INITIALIZE, bearer(sessionToken))
  expectUnauthorized(response)
})

test('an invalid bearer token answers 401', async () => {
  for (const token of ['not-a-token', 'pat_notarealtoken']) {
    const response = await postMCP(INITIALIZE, bearer(token))
    expectUnauthorized(response)
  }
})

test('initialize succeeds with a PAT and returns the instructions', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(INITIALIZE, bearer(token))
  expect(response.headers.get('access-control-allow-origin')).toBe('*')
  await expectInitialized(response)
})

test('a notification is accepted with 202', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(
    {jsonrpc: '2.0', method: 'notifications/initialized'},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect(response.status).toBe(202)
})

test('initialize succeeds with an OAuth token bound to /mcp', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const response = await postMCP(INITIALIZE, bearer(token))
  await expectInitialized(response)
})

test('initialize succeeds with an OAuth token bound to no resource', async () => {
  const token = await createOAuthAccessToken()
  const response = await postMCP(INITIALIZE, bearer(token))
  await expectInitialized(response)
})

test('a body over 4 MiB answers 413', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(
    {...INITIALIZE, padding: 'x'.repeat(4 * 1024 * 1024)},
    bearer(token)
  )
  expect(response.status).toBe(413)
})

test('the same /mcp-bound token is still refused at /graphql', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const response = await fetch(`${ORIGIN}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json', ...bearer(token)},
    body: JSON.stringify({query: '{viewer{id}}'})
  })
  const body = await response.json()
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors?.[0]).toMatchObject({
    message: `This access token is for ${MCP_URL}`,
    extensions: {code: 'UNAUTHENTICATED'}
  })
})

test('GET and DELETE /mcp answer 405 and allow POST', async () => {
  for (const method of ['GET', 'DELETE']) {
    const response = await fetch(MCP_URL, {method})
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
  }
})

test('a browser client can preflight /mcp', async () => {
  const response = await fetch(MCP_URL, {
    method: 'OPTIONS',
    headers: {
      origin: 'http://localhost:6274',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'authorization, content-type, mcp-protocol-version'
    }
  })
  expect(response.status).toBe(204)
  expect(response.headers.get('access-control-allow-origin')).toBe('*')
  expect(response.headers.get('access-control-allow-headers')).toBe(
    'authorization, content-type, mcp-protocol-version'
  )
  expect(response.headers.get('access-control-expose-headers')).toBe('www-authenticate')
})

test('an OAuth token bound to another resource is refused', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const authToken = getVerifiedAuthToken(token, true, 'action-oauth2')!
  const forged = encodeAuthToken({...authToken, resource: 'https://evil/mcp'})
  const response = await postMCP(INITIALIZE, bearer(forged))
  expectUnauthorized(response)
  expect(await response.json()).toMatchObject({
    error_description: 'This access token is for https://evil/mcp'
  })
})

test('tools/list gives every tool a title and annotations', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(
    {jsonrpc: '2.0', id: 3, method: 'tools/list'},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  const {tools} = (await response.json()).result
  expect(tools.map(({name}: {name: string}) => name).sort()).toEqual([
    'describe_type',
    'graphql_mutate',
    'graphql_query',
    'search_schema'
  ])
  for (const tool of tools) {
    expect(tool.title).toBeTruthy()
    expect(tool.description).toBeTruthy()
    expect(tool.annotations).toBeDefined()
  }
  const byName = Object.fromEntries(tools.map((tool: {name: string}) => [tool.name, tool]))
  expect(byName.graphql_mutate.annotations).toMatchObject({
    readOnlyHint: false,
    destructiveHint: true
  })
  for (const name of ['graphql_query', 'search_schema', 'describe_type']) {
    expect(byName[name].annotations.readOnlyHint).toBe(true)
  }
})

test('graphql_query runs a query with a PAT', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_query', {query: '{viewer{id}}'})
  expect(result.isError).toBeUndefined()
  expect(JSON.parse(result.content[0]!.text).viewer.id).toEqual(expect.any(String))
})

test('graphql_query runs a query with an OAuth token bound to /mcp', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const result = await callTool(token, 'graphql_query', {
    query: 'query Me {viewer{id}}',
    operationName: 'Me'
  })
  expect(result.isError).toBeUndefined()
  expect(JSON.parse(result.content[0]!.text).viewer.id).toEqual(expect.any(String))
})

test('graphql_query refuses a mutation', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_query', {query: 'mutation {logout}'})
  expectToolError(result, 'graphql_mutate')
})

test('graphql_mutate refuses a query', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_mutate', {query: '{viewer{id}}'})
  expectToolError(result, 'graphql_query')
})

test('a GraphQL error comes back as a tool error with its code', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_query', {query: '{viewer{noSuchField}}'})
  expect(result.isError).toBe(true)
  expect(JSON.parse(result.content[0]!.text)[0].message).toContain('noSuchField')
})

test('a missing scope comes back as a tool error naming the scope', async () => {
  const token = await createPersonalAccessToken(['PAGES_READ'])
  const result = await callTool(token, 'graphql_mutate', {
    query: `mutation {
      createTask(newTask: {status: active, teamId: "nope"}) {
        task {
          id
        }
      }
    }`
  })
  expectToolError(result, 'tasks:write')
  expect(JSON.parse(result.content[0]!.text)[0].code).toBe('FORBIDDEN')
})

test('search_schema finds a type and a field', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'search_schema', {query: 'createTask', limit: 5})
  expect(result.isError).toBeUndefined()
  expect(result.content[0]!.text).toContain('Mutation.createTask')
})

test('search_schema says when nothing matches', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'search_schema', {query: 'zzzqqqxxx'})
  expect(result.content[0]!.text).toContain('No types or fields match')
})

test('describe_type shows the scopes a mutation needs', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'describe_type', {name: 'Mutation'})
  expect(result.isError).toBeUndefined()
  const createTask = result.content[0]!.text.split('\n').find((line) =>
    line.startsWith('  createTask(')
  )
  expect(createTask).toContain('tasks:write')
})

test('describe_type refuses an unknown type', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'describe_type', {name: 'NoSuchType'})
  expectToolError(result, 'NOT_FOUND')
})
