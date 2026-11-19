import crypto from 'crypto'
import faker from 'faker'
import generateUID from '../generateUID'
import aiAppScopes from '../oauth2/aiAppScopes'
import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import {createOrgAdmin, getTestEmail, HOST, PROTOCOL, sendPublic, signUp} from './common'

const ORIGIN = `${PROTOCOL}://${HOST}`
const AUTHORIZE_URL = `${ORIGIN}/oauth/authorize`
const TOKEN_URL = `${ORIGIN}/oauth/token`

interface Client {
  clientId: string
  redirectUri: string
}

const CLAUDE: Client = {
  clientId: 'https://claude.ai/oauth/mcp-oauth-client-metadata',
  redirectUri: 'https://claude.ai/api/mcp/auth_callback'
}

const CREATE_OAUTH_API_CODE = `
  mutation CreateOAuthAPICode($request: OAuthAuthorizationRequestInput!) {
    createOAuthAPICode(request: $request) {
      redirectUri
    }
  }
`

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

const REGENERATE_OAUTH_API_PROVIDER_SECRET = `
  mutation RegenerateOAuthAPIProviderSecret($providerId: ID!) {
    regenerateOAuthAPIProviderSecret(providerId: $providerId) {
      clientSecret
    }
  }
`

const UPDATE_OAUTH_API_PROVIDER = `
  mutation UpdateOAuthAPIProvider($providerId: ID!, $clientType: OAuthClientTypeEnum) {
    updateOAuthAPIProvider(providerId: $providerId, clientType: $clientType) {
      clientSecret
    }
  }
`

const OAUTH_AUTHORIZATION_REQUEST = `
  query OAuthAuthorizationRequest($request: OAuthAuthorizationRequestInput!) {
    viewer {
      oauthAuthorizationRequest(request: $request) {
        name
        organization {
          id
        }
      }
    }
  }
`

const VIEWER_ID = `
  query ViewerId {
    viewer {
      id
    }
  }
`

const VIEWER_NOTIFICATIONS = `
  query ViewerNotifications {
    viewer {
      notifications(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

interface AuthorizeOptions {
  scope?: string
  state?: string
}

const authorize = async (client: Client, cookie: string, options: AuthorizeOptions = {}) => {
  const {scope, state = 'xyz'} = options
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const request = {...client, scope, state, codeChallenge, codeChallengeMethod: 'S256'}

  const authorizeUrl = new URL(AUTHORIZE_URL)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', client.clientId)
  authorizeUrl.searchParams.set('redirect_uri', client.redirectUri)
  if (scope !== undefined) authorizeUrl.searchParams.set('scope', scope)
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')
  const authorizeResponse = await fetch(authorizeUrl, {headers: {cookie}, redirect: 'manual'})
  expect(authorizeResponse.status).toBe(302)
  expect(new URL(authorizeResponse.headers.get('Location')!).pathname).toBe('/authorize-app')

  const approved = await sendPublic({query: CREATE_OAUTH_API_CODE, variables: {request}, cookie})
  expect(approved.errors).toBeUndefined()
  return {redirectUrl: new URL(approved.data.createOAuthAPICode.redirectUri), codeVerifier}
}

const exchange = (client: Client, redirectUrl: URL, codeVerifier: string) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: redirectUrl.searchParams.get('code')!,
      redirect_uri: client.redirectUri,
      client_id: client.clientId,
      code_verifier: codeVerifier
    })
  })

const connect = async (client: Client, cookie: string, options?: AuthorizeOptions) => {
  const {redirectUrl, codeVerifier} = await authorize(client, cookie, options)
  const response = await exchange(client, redirectUrl, codeVerifier)
  expect(response.status).toBe(200)
  return response.json()
}

const createGlobalClient = async (redirectUri: string): Promise<Client> => {
  const clientId = `global-test-${generateUID()}`
  await getKysely()
    .insertInto('OAuthAPIProvider')
    .values({
      clientId,
      name: 'Global test app',
      clientType: 'public',
      clientSecret: null,
      orgId: null,
      redirectUris: [redirectUri],
      scopes: aiAppScopes
    })
    .execute()
  return {clientId, redirectUri}
}

const updateClaudeGrant = (
  userId: string,
  values: {grantedOrgIds?: string[] | null; personalGrantedAt?: Date | null}
) =>
  getKysely()
    .updateTable('OAuthAPIGrant')
    .set(values)
    .where('clientId', '=', CLAUDE.clientId)
    .where('userId', '=', userId)
    .execute()

test('any user can authorize Claude without belonging to an owning org', async () => {
  const {userId, cookie} = await signUp()
  const {access_token} = await connect(CLAUDE, cookie)
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: access_token})
  expect(viewer.errors).toBeUndefined()
  expect(viewer.data.viewer.id).toBe(userId)
})

test('asking for more than the working set is narrowed, not refused', async () => {
  const {cookie} = await signUp()
  const tokens = await connect(CLAUDE, cookie, {scope: 'pages:write orgs:write'})
  expect(tokens.scope).toBe('pages:write')
})

test('omitting scope grants the working set', async () => {
  const {cookie} = await signUp()
  const tokens = await connect(CLAUDE, cookie)
  expect(tokens.scope.split(' ').sort()).toEqual([...aiAppScopes].sort())
})

test('a 512-character state survives the round trip', async () => {
  const {cookie} = await signUp()
  const state = crypto.randomBytes(384).toString('base64url')
  expect(state).toHaveLength(512)
  const {redirectUrl} = await authorize(CLAUDE, cookie, {state})
  expect(redirectUrl.searchParams.get('state')).toBe(state)

  const client = await createGlobalClient(`https://${faker.internet.domainName()}/callback?a=b`)
  const withQuery = await authorize(client, cookie, {state})
  expect(withQuery.redirectUrl.searchParams.get('a')).toBe('b')
  expect(withQuery.redirectUrl.searchParams.get('state')).toBe(state)
  const response = await exchange(client, withQuery.redirectUrl, withQuery.codeVerifier)
  expect(response.status).toBe(200)
})

test('the authorization response names the issuer', async () => {
  const {cookie} = await signUp()
  const {redirectUrl} = await authorize(CLAUDE, cookie)
  expect(redirectUrl.searchParams.get('iss')).toBe(ORIGIN)
})

test('the consent request for a global client names no organization', async () => {
  const {cookie} = await signUp()
  const codeChallenge = crypto.randomBytes(32).toString('base64url')
  const consent = await sendPublic({
    query: OAUTH_AUTHORIZATION_REQUEST,
    variables: {request: {...CLAUDE, state: 'xyz', codeChallenge, codeChallengeMethod: 'S256'}},
    cookie
  })
  expect(consent.errors).toBeUndefined()
  expect(consent.data.viewer.oauthAuthorizationRequest).toEqual({
    name: 'Claude',
    organization: null
  })
})

test('an org-owned client still refuses extra scopes', async () => {
  const {cookie, orgId} = await createOrgAdmin(getTestEmail())
  const redirectUri = `https://${faker.internet.domainName()}/${faker.internet.domainWord()}`
  const created = await sendPublic({
    query: CREATE_OAUTH_API_PROVIDER,
    variables: {orgId, name: 'Org app', redirectUris: [redirectUri], scopes: ['USERS_READ']},
    cookie
  })
  expect(created.errors).toBeUndefined()
  const {clientId} = created.data.createOAuthAPIProvider
  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {request: {clientId, redirectUri, scope: 'users:read users:write', state: 'xyz'}},
    cookie
  })
  expect(approved.data).toBeNull()
  expect(approved.errors?.[0]).toMatchObject({
    message: expect.stringMatching('Invalid scope'),
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test('a public verified client cannot be given a secret', async () => {
  const {cookie} = await createOrgAdmin(getTestEmail())
  const claude = await getKysely()
    .selectFrom('OAuthAPIProvider')
    .select('id')
    .where('clientId', '=', CLAUDE.clientId)
    .executeTakeFirstOrThrow()
  const providerId = CipherId.toClient(claude.id, 'OAuthAPIProvider')

  const regenerated = await sendPublic({
    query: REGENERATE_OAUTH_API_PROVIDER_SECRET,
    variables: {providerId},
    cookie
  })
  expect(regenerated.data).toBeNull()
  expect(regenerated.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const madeConfidential = await sendPublic({
    query: UPDATE_OAUTH_API_PROVIDER,
    variables: {providerId, clientType: 'CONFIDENTIAL'},
    cookie
  })
  expect(madeConfidential.data).toBeNull()
  expect(madeConfidential.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const row = await getKysely()
    .selectFrom('OAuthAPIProvider')
    .select(['clientType', 'clientSecret', 'verifiedAt'])
    .where('id', '=', claude.id)
    .executeTakeFirstOrThrow()
  expect(row).toEqual({clientType: 'public', clientSecret: null, verifiedAt: expect.any(Date)})
})

test('a connection with private pages reads notifications, one without is told why', async () => {
  const {userId, cookie} = await signUp()
  const {access_token} = await connect(CLAUDE, cookie)
  const allowed = await sendPublic({query: VIEWER_NOTIFICATIONS, bearerToken: access_token})
  expect(allowed.errors).toBeUndefined()
  expect(Array.isArray(allowed.data.viewer.notifications.edges)).toBe(true)

  await updateClaudeGrant(userId, {personalGrantedAt: null})
  const refused = await sendPublic({query: VIEWER_NOTIFICATIONS, bearerToken: access_token})
  expect(refused.errors?.[0]).toMatchObject({
    message: "This access token doesn't include your private pages and invitations",
    extensions: {code: 'FORBIDDEN'}
  })
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: access_token})
  expect(viewer.data.viewer.id).toBe(userId)
})

test('a connection left with no organizations and no private pages is refused', async () => {
  const {userId, cookie} = await signUp()
  const {access_token} = await connect(CLAUDE, cookie)
  await updateClaudeGrant(userId, {grantedOrgIds: [generateUID()], personalGrantedAt: null})
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: access_token})
  expect(viewer.errors?.[0]).toMatchObject({
    message: 'None of the organizations this app was connected to allow it anymore',
    extensions: {code: 'FORBIDDEN'}
  })
})

test('the asset proxy answers a refused connection 403', async () => {
  const {userId, cookie} = await signUp()
  const {access_token} = await connect(CLAUDE, cookie)
  await updateClaudeGrant(userId, {grantedOrgIds: [generateUID()], personalGrantedAt: null})
  const asset = await fetch(`${ORIGIN}/assets/User/${userId}/assets/notes.txt`, {
    headers: {authorization: `Bearer ${access_token}`},
    redirect: 'manual'
  })
  expect(asset.status).toBe(403)
})
