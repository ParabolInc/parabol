import crypto from 'crypto'
import faker from 'faker'
import getKysely from '../postgres/getKysely'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {HOST, PROTOCOL, sendIntranet, sendPublic, signUp} from './common'

const ORIGIN = `${PROTOCOL}://${HOST}`
const TOKEN_URL = `${ORIGIN}/oauth/token`
const MCP_RESOURCE = `${ORIGIN}/mcp`

const CREATE_OAUTH_API_PROVIDER = `
  mutation CreateOAuthAPIProvider(
    $orgId: ID!
    $name: String!
    $redirectUris: [RedirectURI!]!
    $scopes: [OAuthScopeEnum!]!
  ) {
    createOAuthAPIProvider(
      orgId: $orgId
      name: $name
      redirectUris: $redirectUris
      scopes: $scopes
    ) {
      clientId
      clientSecret
    }
  }
`

const CREATE_OAUTH_API_CODE = `
  mutation CreateOAuthAPICode($request: OAuthAuthorizationRequestInput!) {
    createOAuthAPICode(request: $request) {
      redirectUri
    }
  }
`

const createApp = async () => {
  const {userId, cookie, orgId} = await signUp()
  const promoted = await sendIntranet({
    query: `
      mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: OrgUserRole) {
        setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
          __typename
        }
      }
    `,
    variables: {orgId, userId, role: 'ORG_ADMIN'}
  })
  expect(promoted.errors).toBeUndefined()
  const redirectUri = `https://${faker.internet.domainName()}/${faker.internet.domainWord()}`
  const created = await sendPublic({
    query: CREATE_OAUTH_API_PROVIDER,
    variables: {
      orgId,
      name: 'Discovery test app',
      redirectUris: [redirectUri],
      scopes: ['USERS_READ']
    },
    cookie
  })
  expect(created.errors).toBeUndefined()
  const {clientId, clientSecret} = created.data.createOAuthAPIProvider
  return {userId, cookie, clientId, clientSecret, redirectUri}
}

type App = Awaited<ReturnType<typeof createApp>>

const authorize = (app: App, resource?: string) =>
  sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {
      request: {
        clientId: app.clientId,
        redirectUri: app.redirectUri,
        scope: 'users:read',
        state: 'xyz',
        resource
      }
    },
    cookie: app.cookie
  })

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
    client_secret: app.clientSecret,
    ...(resource && {resource})
  })

test('authorization server metadata lists S256 and both grant types', async () => {
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
    token_endpoint_auth_methods_supported: ['client_secret_post', 'none']
  })
  expect(metadata.scopes_supported).toEqual(expect.arrayContaining(['users:read', 'files:write']))
  expect(metadata.scopes_supported).toHaveLength(20)
})

test('protected resource metadata names the /mcp resource and this server', async () => {
  for (const path of [
    '/.well-known/oauth-protected-resource',
    '/.well-known/oauth-protected-resource/mcp'
  ]) {
    const response = await fetch(`${ORIGIN}${path}`)
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
    expect(metadata.scopes_supported).toHaveLength(20)
  }
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
    client_id: app.clientId,
    client_secret: app.clientSecret
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
  const code = await getCode(app, MCP_RESOURCE)
  const tokens = await (await exchange(app, code, MCP_RESOURCE)).json()
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

const getAccessToken = async (app: App) => {
  const code = await getCode(app, MCP_RESOURCE)
  return (await (await exchange(app, code, MCP_RESOURCE)).json()).access_token as string
}

test('a session cookie does not lend its authority to an OAuth bearer on a non-persisted query', async () => {
  const app = await createApp()
  const other = await createApp()
  const accessToken = await getAccessToken(app)
  const body = await queryRaw({authorization: `Bearer ${accessToken}`, cookie: other.cookie})
  expect(body.data?.viewer?.id).not.toBe(other.userId)
  expect(body.data?.viewer?.id).toBe(app.userId)
})

test('an OAuth token with a revoked grant cannot run a non-persisted query', async () => {
  const app = await createApp()
  const accessToken = await getAccessToken(app)
  await getKysely()
    .updateTable('OAuthAPIGrant')
    .set({revokedAt: new Date()})
    .where('clientId', '=', app.clientId)
    .execute()
  const body = await queryRaw({authorization: `Bearer ${accessToken}`})
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors).toBeDefined()
})

test('a revoked OAuth token alongside a cookie cannot run a non-persisted query', async () => {
  const app = await createApp()
  const other = await createApp()
  const accessToken = await getAccessToken(app)
  await getKysely()
    .updateTable('OAuthAPIGrant')
    .set({revokedAt: new Date()})
    .where('clientId', '=', app.clientId)
    .execute()
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
