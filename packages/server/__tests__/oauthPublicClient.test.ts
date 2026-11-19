import crypto from 'crypto'
import faker from 'faker'
import getKysely from '../postgres/getKysely'
import {HOST, PROTOCOL, sendIntranet, sendPublic, signUp} from './common'

const TOKEN_URL = `${PROTOCOL}://${HOST}/oauth/token`

const CREATE_OAUTH_API_PROVIDER = `
  mutation CreateOAuthAPIProvider(
    $orgId: ID!
    $name: String!
    $redirectUris: [RedirectURI!]!
    $scopes: [OAuthScopeEnum!]!
    $clientType: OAuthClientTypeEnum!
  ) {
    createOAuthAPIProvider(
      orgId: $orgId
      name: $name
      redirectUris: $redirectUris
      scopes: $scopes
      clientType: $clientType
    ) {
      provider {
        id
        clientType
      }
      clientId
      clientSecret
    }
  }
`

const UPDATE_OAUTH_API_PROVIDER = `
  mutation UpdateOAuthAPIProvider($providerId: ID!, $clientType: OAuthClientTypeEnum) {
    updateOAuthAPIProvider(providerId: $providerId, clientType: $clientType) {
      clientSecret
      provider {
        clientType
      }
    }
  }
`

const REGENERATE_OAUTH_API_PROVIDER_SECRET = `
  mutation RegenerateOAuthAPIProviderSecret($providerId: ID!) {
    regenerateOAuthAPIProviderSecret(providerId: $providerId) {
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

const createOrgAdmin = async () => {
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
  return {cookie, orgId}
}

const createApp = async (
  clientType: 'CONFIDENTIAL' | 'PUBLIC',
  redirectUri = `https://${faker.internet.domainName()}/${faker.internet.domainWord()}`
) => {
  const {cookie, orgId} = await createOrgAdmin()
  const created = await sendPublic({
    query: CREATE_OAUTH_API_PROVIDER,
    variables: {
      orgId,
      name: 'Test OAuth App',
      redirectUris: [redirectUri],
      scopes: ['USERS_READ'],
      clientType
    },
    cookie
  })
  expect(created.errors).toBeUndefined()
  const {clientId, clientSecret, provider} = created.data.createOAuthAPIProvider
  return {cookie, clientId, clientSecret, redirectUri, provider}
}

const createPKCEPair = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  return {codeVerifier, codeChallenge}
}

const createCode = async (
  app: {cookie: string; clientId: string; redirectUri: string},
  codeChallenge?: string
) => {
  const {cookie, clientId, redirectUri} = app
  const response = await sendPublic({
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
  return response
}

const exchangeCode = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type: 'authorization_code', ...params})
  })

const getCode = async (
  app: {cookie: string; clientId: string; redirectUri: string},
  codeChallenge?: string
) => {
  const response = await createCode(app, codeChallenge)
  expect(response.errors).toBeUndefined()
  return new URL(response.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
}

test('a public client exchanges a code with PKCE and no secret', async () => {
  const app = await createApp('PUBLIC')
  expect(app.clientSecret).toBeNull()
  expect(app.provider.clientType).toBe('PUBLIC')
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

test('a public client must send a code challenge at authorize', async () => {
  const app = await createApp('PUBLIC')
  const response = await createCode(app)
  expect(response.errors?.[0]).toMatchObject({
    message: 'Invalid code_challenge: public clients must use PKCE',
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test('a public client code without a code_verifier is refused', async () => {
  const app = await createApp('PUBLIC')
  const {codeChallenge} = createPKCEPair()
  const code = await getCode(app, codeChallenge)
  const response = await exchangeCode({
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId
  })
  expect(response.status).toBe(400)
  expect(await response.json()).toMatchObject({error: 'invalid_grant'})
})

test('a confidential client still needs its secret', async () => {
  const app = await createApp('CONFIDENTIAL')
  expect(app.provider.clientType).toBe('CONFIDENTIAL')
  const code = await getCode(app)
  const response = await exchangeCode({
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId
  })
  expect(response.status).toBe(401)
  expect(await response.json()).toMatchObject({error: 'invalid_client'})
})

test('switching an app to public clears its secret', async () => {
  const app = await createApp('CONFIDENTIAL')
  const toPublic = await sendPublic({
    query: UPDATE_OAUTH_API_PROVIDER,
    variables: {providerId: app.provider.id, clientType: 'PUBLIC'},
    cookie: app.cookie
  })
  expect(toPublic.errors).toBeUndefined()
  expect(toPublic.data.updateOAuthAPIProvider).toMatchObject({
    clientSecret: null,
    provider: {clientType: 'PUBLIC'}
  })
  const row = await getKysely()
    .selectFrom('OAuthAPIProvider')
    .select(['clientSecret', 'clientType'])
    .where('clientId', '=', app.clientId)
    .executeTakeFirstOrThrow()
  expect(row).toEqual({clientSecret: null, clientType: 'public'})

  const toConfidential = await sendPublic({
    query: UPDATE_OAUTH_API_PROVIDER,
    variables: {providerId: app.provider.id, clientType: 'CONFIDENTIAL'},
    cookie: app.cookie
  })
  expect(toConfidential.errors).toBeUndefined()
  const {clientSecret} = toConfidential.data.updateOAuthAPIProvider
  expect(clientSecret).toEqual(expect.any(String))
  const confidentialRow = await getKysely()
    .selectFrom('OAuthAPIProvider')
    .select(['clientSecret', 'clientType'])
    .where('clientId', '=', app.clientId)
    .executeTakeFirstOrThrow()
  expect(confidentialRow).toEqual({clientSecret, clientType: 'confidential'})
})

test('a public client has no secret to regenerate', async () => {
  const app = await createApp('PUBLIC')
  const response = await sendPublic({
    query: REGENERATE_OAUTH_API_PROVIDER_SECRET,
    variables: {providerId: app.provider.id},
    cookie: app.cookie
  })
  expect(response.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
})

const VIEWER_ID = `
  query ViewerId {
    viewer {
      id
    }
  }
`

const postToken = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params)
  })

type App = Awaited<ReturnType<typeof createApp>>

const connect = async (app: App) => {
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const code = await getCode(app, codeChallenge)
  const response = await exchangeCode({
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId,
    code_verifier: codeVerifier,
    ...(app.clientSecret && {client_secret: app.clientSecret})
  })
  expect(response.status).toBe(200)
  return response.json()
}

const switchClientType = async (app: App, clientType: 'CONFIDENTIAL' | 'PUBLIC') => {
  const response = await sendPublic({
    query: UPDATE_OAUTH_API_PROVIDER,
    variables: {providerId: app.provider.id, clientType},
    cookie: app.cookie
  })
  expect(response.errors).toBeUndefined()
  return response.data.updateOAuthAPIProvider.clientSecret as string | null
}

const getViewerErrorCode = async (accessToken: string) => {
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: accessToken})
  return viewer.errors?.[0]?.extensions?.code
}

const authorizeAt = (app: App, redirectUri: string) =>
  createCode({...app, redirectUri}, createPKCEPair().codeChallenge)

test('a public client may send its loopback redirect on any port', async () => {
  const app = await createApp('PUBLIC', 'http://127.0.0.1/callback')
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

test('a confidential client gets no loopback port flexibility', async () => {
  const app = await createApp('CONFIDENTIAL', 'http://127.0.0.1/callback')
  const response = await authorizeAt(app, 'http://127.0.0.1:53111/callback')
  expect(response.errors?.[0]).toMatchObject({
    message: 'Invalid redirect_uri: it is not registered for this client',
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test('a public loopback redirect with another path or host is refused', async () => {
  const app = await createApp('PUBLIC', 'http://127.0.0.1/callback')
  for (const redirectUri of [
    'http://127.0.0.1:53111/other',
    'http://localhost:53111/callback',
    'http://127.0.0.1:53111/callback?extra=1',
    'https://127.0.0.1:53111/callback'
  ]) {
    const response = await authorizeAt(app, redirectUri)
    expect(response.errors?.[0]).toMatchObject({
      message: 'Invalid redirect_uri: it is not registered for this client',
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
})

test('switching a confidential app to public disconnects everyone', async () => {
  const app = await createApp('CONFIDENTIAL')
  const tokens = await connect(app)
  expect(await getViewerErrorCode(tokens.access_token)).toBeUndefined()

  await switchClientType(app, 'PUBLIC')

  expect(await getViewerErrorCode(tokens.access_token)).toBe('UNAUTHENTICATED')
  const refreshed = await postToken({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: app.clientId
  })
  expect(refreshed.status).toBe(400)
  expect(await refreshed.json()).toMatchObject({error: 'invalid_grant'})
})

test('switching a public app to confidential disconnects everyone', async () => {
  const app = await createApp('PUBLIC')
  const tokens = await connect(app)
  expect(await getViewerErrorCode(tokens.access_token)).toBeUndefined()

  const clientSecret = await switchClientType(app, 'CONFIDENTIAL')

  expect(await getViewerErrorCode(tokens.access_token)).toBe('UNAUTHENTICATED')
  const refreshed = await postToken({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: app.clientId,
    client_secret: clientSecret!
  })
  expect(refreshed.status).toBe(400)
  expect(await refreshed.json()).toMatchObject({error: 'invalid_grant'})
})

test('a public client that sends a client_secret is refused', async () => {
  const app = await createApp('PUBLIC')
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

test('a public client refreshes with no secret', async () => {
  const app = await createApp('PUBLIC')
  const tokens = await connect(app)
  const refreshed = await postToken({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: app.clientId
  })
  expect(refreshed.status).toBe(200)
  expect(await refreshed.json()).toMatchObject({refresh_token: expect.stringMatching(/^prt_/)})
})

test('a confidential client cannot refresh without its secret', async () => {
  const app = await createApp('CONFIDENTIAL')
  const tokens = await connect(app)
  const refreshed = await postToken({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: app.clientId
  })
  expect(refreshed.status).toBe(401)
  expect(await refreshed.json()).toMatchObject({error: 'invalid_client'})
})

test('a public client registered on [::1] may use any port there', async () => {
  const app = await createApp('PUBLIC', 'http://[::1]/callback')
  const response = await authorizeAt(app, 'http://[::1]:53111/callback')
  expect(response.errors).toBeUndefined()
})

test('a code issued before a client type switch cannot be exchanged after it', async () => {
  const app = await createApp('CONFIDENTIAL')
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const code = await getCode(app, codeChallenge)

  await switchClientType(app, 'PUBLIC')

  const response = await exchangeCode({
    code,
    redirect_uri: app.redirectUri,
    client_id: app.clientId,
    code_verifier: codeVerifier
  })
  expect(response.status).toBe(400)
  expect(await response.json()).toMatchObject({error: 'invalid_grant'})
})
