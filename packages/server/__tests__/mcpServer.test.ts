import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import mcpInstructions from '../mcp/mcpInstructions'
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

const createPersonalAccessToken = async () => {
  const {cookie} = await signUp()
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'mcp',
      scopes: ['USERS_READ'],
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
  expect(await response.json()).toMatchObject({
    jsonrpc: '2.0',
    id: 1,
    result: {
      protocolVersion: PROTOCOL_VERSION,
      serverInfo: {name: 'parabol', version: packageJSON.version},
      instructions: mcpInstructions
    }
  })
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
