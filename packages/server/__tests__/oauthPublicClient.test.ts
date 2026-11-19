import crypto from 'crypto'
import faker from 'faker'
import {createOrgAdmin, getTestEmail, HOST, PROTOCOL, sendPublic} from './common'

const TOKEN_URL = `${PROTOCOL}://${HOST}/oauth/token`

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

const createApp = async (
  redirectUri = `https://${faker.internet.domainName()}/${faker.internet.domainWord()}`
) => {
  const {cookie, orgId} = await createOrgAdmin(getTestEmail())
  const created = await sendPublic({
    query: CREATE_OAUTH_API_PROVIDER,
    variables: {orgId, name: 'Test OAuth App', redirectUris: [redirectUri], scopes: ['USERS_READ']},
    cookie
  })
  expect(created.errors).toBeUndefined()
  const {clientId} = created.data.createOAuthAPIProvider
  return {cookie, clientId, redirectUri}
}

type App = Awaited<ReturnType<typeof createApp>>

const createPKCEPair = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  return {codeVerifier, codeChallenge}
}

const createCode = (app: App, codeChallenge?: string) => {
  const {cookie, clientId, redirectUri} = app
  return sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {
      request: {
        clientId,
        redirectUri,
        scope: 'users:read',
        state: 'xyz',
        codeChallenge,
        codeChallengeMethod: codeChallenge ? 'S256' : undefined
      }
    },
    cookie
  })
}

const getCode = async (app: App, codeChallenge: string) => {
  const response = await createCode(app, codeChallenge)
  expect(response.errors).toBeUndefined()
  return new URL(response.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
}

const postToken = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params)
  })

const exchangeCode = (params: Record<string, string>) =>
  postToken({grant_type: 'authorization_code', ...params})

const authorizeAt = (app: App, redirectUri: string) =>
  createCode({...app, redirectUri}, createPKCEPair().codeChallenge)

const expectUnregisteredRedirect = (response: Awaited<ReturnType<typeof createCode>>) =>
  expect(response.errors?.[0]).toMatchObject({
    message: 'Invalid redirect_uri: it is not registered for this client',
    extensions: {code: 'BAD_USER_INPUT'}
  })

test('a client exchanges a code with PKCE and no secret', async () => {
  const app = await createApp()
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const code = await getCode(app, codeChallenge)
  const response = await exchangeCode({
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId,
    code_verifier: codeVerifier
  })
  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({access_token: expect.any(String)})
})

test('a client must send a code challenge at authorize', async () => {
  const app = await createApp()
  const response = await createCode(app)
  expect(response.errors?.[0]).toMatchObject({
    message: 'Invalid code_challenge: PKCE is required',
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test('a code without a code_verifier is refused', async () => {
  const app = await createApp()
  const code = await getCode(app, createPKCEPair().codeChallenge)
  const response = await exchangeCode({
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId
  })
  expect(response.status).toBe(400)
  expect(await response.json()).toMatchObject({error: 'invalid_grant'})
})

test('a client that sends a client_secret is refused', async () => {
  const app = await createApp()
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const code = await getCode(app, codeChallenge)
  const response = await exchangeCode({
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId,
    client_secret: 'made-up-secret',
    code_verifier: codeVerifier
  })
  expect(response.status).toBe(401)
  expect(await response.json()).toMatchObject({error: 'invalid_client'})
})

test('a client refreshes with no secret', async () => {
  const app = await createApp()
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const code = await getCode(app, codeChallenge)
  const tokens = await (
    await exchangeCode({
      code,
      redirect_uri: app.redirectUri,
      client_id: app.clientId,
      code_verifier: codeVerifier
    })
  ).json()
  const refreshed = await postToken({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: app.clientId
  })
  expect(refreshed.status).toBe(200)
  expect(await refreshed.json()).toMatchObject({refresh_token: expect.stringMatching(/^prt_/)})
})

test('a loopback redirect may use any port', async () => {
  const app = await createApp('http://127.0.0.1/callback')
  const redirectUri = 'http://127.0.0.1:53111/callback'
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const code = await getCode({...app, redirectUri}, codeChallenge)
  const response = await exchangeCode({
    code,
    redirect_uri: redirectUri,
    client_id: app.clientId,
    code_verifier: codeVerifier
  })
  expect(response.status).toBe(200)
})

test('a client registered on [::1] may use any port there', async () => {
  const app = await createApp('http://[::1]/callback')
  const response = await authorizeAt(app, 'http://[::1]:53111/callback')
  expect(response.errors).toBeUndefined()
})

test('a loopback redirect with another path or host is refused', async () => {
  const app = await createApp('http://127.0.0.1/callback')
  for (const redirectUri of [
    'http://127.0.0.1:53111/other',
    'http://localhost:53111/callback',
    'http://127.0.0.1:53111/callback?extra=1',
    'https://127.0.0.1:53111/callback'
  ]) {
    expectUnregisteredRedirect(await authorizeAt(app, redirectUri))
  }
})

test('an https redirect gets no port flexibility', async () => {
  const app = await createApp('https://example.com/callback')
  expectUnregisteredRedirect(await authorizeAt(app, 'https://example.com:8443/callback'))
})
