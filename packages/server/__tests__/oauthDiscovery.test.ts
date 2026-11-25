import crypto from 'crypto'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {HOST, PROTOCOL, sendPublic, signUp} from './common'
import {createClient, createCode, createPKCEPair} from './oauthClient'

const ORIGIN = `${PROTOCOL}://${HOST}`
const TOKEN_URL = `${ORIGIN}/oauth/token`
const MCP_RESOURCE = `${ORIGIN}/mcp`

const createApp = async () => {
  const [{userId, cookie}, {clientId, redirectUri}] = await Promise.all([signUp(), createClient()])
  return {userId, cookie, clientId, redirectUri, ...createPKCEPair()}
}

type App = Awaited<ReturnType<typeof createApp>>

const authorize = (app: App, resource?: string) =>
  createCode(
    {
      clientId: app.clientId,
      redirectUri: app.redirectUri,
      scope: 'users:read',
      codeChallenge: app.codeChallenge,
      resource
    },
    app.cookie
  )

const getCode = async (app: App, resource?: string) => {
  const response = await authorize(app, resource)
  expect(response.errors).toBeUndefined()
  return new URL(response.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
}

const postToken = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params)
  })

const exchange = (app: App, code: string, resource?: string) =>
  postToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId,
    code_verifier: app.codeVerifier,
    ...(resource && {resource})
  })

test('authorization server metadata lists S256, both grant types and self-registration', async () => {
  const response = await fetch(`${ORIGIN}/.well-known/oauth-authorization-server`)
  expect(response.status).toBe(200)
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  expect(response.headers.get('Content-Type')).toContain('application/json')
  const metadata = await response.json()
  expect(metadata).toMatchObject({
    issuer: ORIGIN,
    authorization_endpoint: `${ORIGIN}/oauth/authorize`,
    token_endpoint: `${ORIGIN}/oauth/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    registration_endpoint: `${ORIGIN}/oauth/register`
  })
  expect(metadata.scopes_supported).toEqual(expect.arrayContaining(['users:read', 'pages:write']))
  expect(metadata.scopes_supported).toHaveLength(18)
})

test('protected resource metadata names the /mcp resource and this server', async () => {
  const response = await fetch(`${ORIGIN}/.well-known/oauth-protected-resource/mcp`)
  expect(response.status).toBe(200)
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  expect(response.headers.get('Content-Type')).toContain('application/json')
  const metadata = await response.json()
  expect(metadata).toMatchObject({
    resource: MCP_RESOURCE,
    authorization_servers: [ORIGIN],
    bearer_methods_supported: ['header'],
    resource_name: 'Parabol'
  })
  expect(metadata.scopes_supported).toHaveLength(18)
})

test('the origin itself is not described as a protected resource', async () => {
  const response = await fetch(`${ORIGIN}/.well-known/oauth-protected-resource`)
  expect(response.headers.get('Content-Type') ?? '').not.toContain('application/json')
})

test('a browser client can preflight the token, registration and metadata endpoints', async () => {
  for (const path of [
    '/oauth/token',
    '/oauth/register',
    '/.well-known/oauth-authorization-server',
    '/.well-known/oauth-protected-resource/mcp'
  ]) {
    const response = await fetch(`${ORIGIN}${path}`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:6274',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type, mcp-protocol-version'
      }
    })
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('mcp-protocol-version')
  }
})

test('token endpoint answers, errors included, can be read by a browser client', async () => {
  const response = await postToken({grant_type: 'authorization_code', client_id: 'nobody'})
  expect(response.status).toBe(401)
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  expect(response.headers.get('Cache-Control')).toBe('no-store')
})

test('a resource other than /mcp is refused at authorize', async () => {
  const app = await createApp()
  const response = await authorize(app, `${ORIGIN}/other`)
  expect(response.errors?.[0]).toMatchObject({
    message: 'Invalid resource: only <origin>/mcp is served',
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test('the access token carries the resource it was issued for', async () => {
  const app = await createApp()
  const code = await getCode(app, MCP_RESOURCE)
  const response = await exchange(app, code, MCP_RESOURCE)
  expect(response.status).toBe(200)
  const tokens = await response.json()
  const authToken = getVerifiedAuthToken(tokens.access_token, true, 'action-oauth2')!
  expect(authToken.resource).toBe(MCP_RESOURCE)

  const refreshed = await postToken({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: app.clientId
  })
  expect(refreshed.status).toBe(200)
  const refreshedToken = getVerifiedAuthToken(
    (await refreshed.json()).access_token,
    true,
    'action-oauth2'
  )!
  expect(refreshedToken.resource).toBe(MCP_RESOURCE)
})

test('a token request naming a different resource than the code is refused', async () => {
  const app = await createApp()
  const code = await getCode(app, MCP_RESOURCE)
  const response = await exchange(app, code, `${ORIGIN}/other`)
  expect(response.status).toBe(400)
  expect(await response.json()).toMatchObject({error: 'invalid_target'})
})

test('an OAuth access token can run a query that is not persisted', async () => {
  const app = await createApp()
  const code = await getCode(app)
  const tokens = await (await exchange(app, code)).json()
  const response = await fetch(`${ORIGIN}/graphql`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${tokens.access_token}`
    },
    body: JSON.stringify({query: '{viewer{id}}'})
  })
  const body = await response.json()
  expect(body.errors).toBeUndefined()
  expect(body.data.viewer.id).toBe(app.userId)
})

test('an unauthenticated request still cannot run a query that is not persisted', async () => {
  const response = await fetch(`${ORIGIN}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({query: `{viewer{id}}`, extensions: {nonce: crypto.randomUUID()}})
  })
  const body = await response.json()
  expect(body.errors).toBeDefined()
})

const queryRaw = (headers: Record<string, string>) =>
  fetch(`${ORIGIN}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json', ...headers},
    body: JSON.stringify({query: '{viewer{id}}'})
  }).then((response) => response.json())

const getAccessToken = async (app: App, resource?: string) => {
  const code = await getCode(app, resource)
  return (await (await exchange(app, code, resource)).json()).access_token as string
}

test('a token bound to /mcp is refused at /graphql', async () => {
  const app = await createApp()
  const accessToken = await getAccessToken(app, MCP_RESOURCE)
  const body = await queryRaw({authorization: `Bearer ${accessToken}`})
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors?.[0]).toMatchObject({
    message: `This access token is for ${MCP_RESOURCE}`,
    extensions: {code: 'UNAUTHENTICATED'}
  })
})

test('a session cookie does not lend its authority to an OAuth bearer on a non-persisted query', async () => {
  const app = await createApp()
  const other = await createApp()
  const accessToken = await getAccessToken(app)
  const body = await queryRaw({authorization: `Bearer ${accessToken}`, cookie: other.cookie})
  expect(body.data?.viewer?.id).not.toBe(other.userId)
  expect(body.data?.viewer?.id).toBe(app.userId)
})

test('an OAuth token whose grant was removed cannot run a non-persisted query', async () => {
  const app = await createApp()
  const accessToken = await getAccessToken(app)
  await getKysely().deleteFrom('OAuthAPIGrant').where('clientId', '=', app.clientId).execute()
  const body = await queryRaw({authorization: `Bearer ${accessToken}`})
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors).toBeDefined()
})

test('an OAuth token whose grant was removed cannot borrow a cookie on a non-persisted query', async () => {
  const app = await createApp()
  const other = await createApp()
  const accessToken = await getAccessToken(app)
  await getKysely().deleteFrom('OAuthAPIGrant').where('clientId', '=', app.clientId).execute()
  const body = await queryRaw({authorization: `Bearer ${accessToken}`, cookie: other.cookie})
  expect(body.data?.viewer?.id).toBeUndefined()
})

test('a malformed authorization scheme is refused a non-persisted query', async () => {
  const app = await createApp()
  const accessToken = await getAccessToken(app)
  for (const authorization of [`Xearer ${accessToken}`, 'Xearer pat_x']) {
    const body = await queryRaw({authorization})
    expect(body.errors).toBeDefined()
    expect(body.data?.viewer?.id).toBeUndefined()
  }
})

test('an empty resource is treated as no resource', async () => {
  const app = await createApp()
  const code = await getCode(app, '')
  const response = await exchange(app, code, '')
  expect(response.status).toBe(200)
  const tokens = await response.json()
  const authToken = getVerifiedAuthToken(tokens.access_token, true, 'action-oauth2')!
  expect(authToken.resource).toBeUndefined()
})

test('a PAT-shaped bearer beside a mismatched application header cannot borrow the cookie session', async () => {
  const app = await createApp()
  const body = await queryRaw({
    cookie: app.cookie,
    'x-application-authorization': 'x',
    authorization: 'Bearer pat_x'
  })
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors).toBeDefined()
})

test('a session JWT in the application header cannot borrow a PAT-shaped bearer', async () => {
  const app = await createApp()
  const sessionToken = app.cookie.split(';')[0]!.split('=').slice(1).join('=')
  const body = await queryRaw({
    'x-application-authorization': `Bearer ${sessionToken}`,
    authorization: 'Bearer pat_x'
  })
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors).toBeDefined()
})

test('a superuser JWT in the authorization header does not unlock a cookie users arbitrary operations', async () => {
  const app = await createApp()
  const superUserToken = encodeAuthToken(new AuthToken({sub: 'parabolAIUser', tms: [], rol: 'su'}))
  const body = await queryRaw({cookie: app.cookie, authorization: `Bearer ${superUserToken}`})
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors).toBeDefined()
})

const expire = (accessToken: string) => {
  const authToken = getVerifiedAuthToken(accessToken, true, 'action-oauth2')!
  return encodeAuthToken({...authToken, exp: Math.floor(Date.now() / 1000) - 60})
}

test('an expired OAuth access token is told it expired on a non-persisted query', async () => {
  const app = await createApp()
  const expiredToken = expire(await getAccessToken(app))
  const body = await queryRaw({authorization: `Bearer ${expiredToken}`})
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors?.[0]).toMatchObject({
    message: 'OAuth access token expired',
    extensions: {code: 'UNAUTHENTICATED'}
  })
})

test('an expired OAuth access token is told it expired on a persisted query', async () => {
  const app = await createApp()
  const expiredToken = expire(await getAccessToken(app))
  const body = await sendPublic({
    query: 'query ExpiredViewer { viewer { id } }',
    bearerToken: expiredToken
  })
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors?.[0]).toMatchObject({
    message: 'OAuth access token expired',
    extensions: {code: 'UNAUTHENTICATED'}
  })
})

test('an expired OAuth access token beside a cookie does not borrow the cookie session', async () => {
  const app = await createApp()
  const other = await createApp()
  const expiredToken = expire(await getAccessToken(app))
  const body = await queryRaw({authorization: `Bearer ${expiredToken}`, cookie: other.cookie})
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})

test('the Bearer scheme is case-insensitive', async () => {
  const app = await createApp()
  const accessToken = await getAccessToken(app)
  for (const scheme of ['bearer', 'BEARER']) {
    const body = await queryRaw({authorization: `${scheme} ${accessToken}`})
    expect(body.errors).toBeUndefined()
    expect(body.data.viewer.id).toBe(app.userId)
  }
})
