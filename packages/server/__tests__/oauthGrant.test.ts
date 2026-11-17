import faker from 'faker'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {HOST, PROTOCOL, sendIntranet, sendPublic, signUp} from './common'

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

const VIEWER_ID = `
  query ViewerId {
    viewer {
      id
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
  return {cookie, orgId, userId}
}

interface App {
  cookie: string
  clientId: string
  clientSecret: string
  redirectUri: string
}

const createApp = async (admin: {cookie: string; orgId: string}): Promise<App> => {
  const {cookie, orgId} = admin
  const redirectUri = `https://${faker.internet.domainName()}/${faker.internet.domainWord()}`
  const created = await sendPublic({
    query: CREATE_OAUTH_API_PROVIDER,
    variables: {orgId, name: 'Grant test app', redirectUris: [redirectUri], scopes: ['USERS_READ']},
    cookie
  })
  expect(created.errors).toBeUndefined()
  const {clientId, clientSecret} = created.data.createOAuthAPIProvider
  return {cookie, clientId, clientSecret, redirectUri}
}

const postToken = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params)
  })

const consent = async (app: App) => {
  const {cookie, clientId, clientSecret, redirectUri} = app
  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {request: {clientId, redirectUri, scope: 'users:read', state: 'xyz'}},
    cookie
  })
  expect(approved.errors).toBeUndefined()
  const code = new URL(approved.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
  const response = await postToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  })
  expect(response.status).toBe(200)
  return response.json()
}

const refresh = (app: App, refreshToken: string) =>
  postToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: app.clientId,
    client_secret: app.clientSecret
  })

const getGrants = (clientId: string) =>
  getKysely()
    .selectFrom('OAuthAPIGrant')
    .select(['id', 'revokedAt'])
    .where('clientId', '=', clientId)
    .execute()

const getViewerErrorCode = async (accessToken: string) => {
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: accessToken})
  return viewer.errors?.[0]?.extensions?.code
}

test('the token response carries a refresh token and a one-hour access token', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  const tokens = await consent(app)
  expect(tokens).toMatchObject({
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'users:read',
    access_token: expect.any(String),
    refresh_token: expect.stringMatching(/^prt_/)
  })
  const authToken = getVerifiedAuthToken(tokens.access_token, true, 'action-oauth2')!
  expect(authToken.exp - authToken.iat).toBe(ms('1h') / 1000)
  expect(authToken.grant_id).toEqual(expect.any(Number))
  expect(authToken.resource).toBeUndefined()
})

test('a refresh token is swapped for new tokens and the old one stops working', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  const first = await consent(app)

  const refreshed = await refresh(app, first.refresh_token)
  expect(refreshed.status).toBe(200)
  expect(refreshed.headers.get('Cache-Control')).toBe('no-store')
  const second = await refreshed.json()
  expect(second).toMatchObject({
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'users:read',
    refresh_token: expect.stringMatching(/^prt_/)
  })
  expect(second.refresh_token).not.toBe(first.refresh_token)
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: second.access_token})
  expect(viewer.data.viewer.id).toBe(admin.userId)

  const reused = await refresh(app, first.refresh_token)
  expect(reused.status).toBe(400)
  expect(await reused.json()).toMatchObject({error: 'invalid_grant'})
})

test('reusing a rotated refresh token revokes the connection', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  const first = await consent(app)
  const second = await (await refresh(app, first.refresh_token)).json()
  expect(await getViewerErrorCode(second.access_token)).toBeUndefined()

  const reused = await refresh(app, first.refresh_token)
  expect(reused.status).toBe(400)

  expect(await getViewerErrorCode(second.access_token)).toBe('UNAUTHENTICATED')
  const afterRevoke = await refresh(app, second.refresh_token)
  expect(afterRevoke.status).toBe(400)
  const [grant] = await getGrants(app.clientId)
  expect(grant!.revokedAt).not.toBeNull()
})

test('two simultaneous refreshes with one token: exactly one succeeds and the connection is revoked', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  const {refresh_token} = await consent(app)

  const responses = await Promise.all([refresh(app, refresh_token), refresh(app, refresh_token)])
  expect(responses.map(({status}) => status).sort()).toEqual([200, 400])

  const grants = await getGrants(app.clientId)
  expect(grants).toHaveLength(1)
  expect(grants[0]!.revokedAt).not.toBeNull()
})

test('a refresh token only works for its own client', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  const otherApp = await createApp(admin)
  const {refresh_token} = await consent(app)

  const stolen = await refresh(otherApp, refresh_token)
  expect(stolen.status).toBe(400)
  expect(await stolen.json()).toMatchObject({error: 'invalid_grant'})
  const [grant] = await getGrants(app.clientId)
  expect(grant!.revokedAt).toBeNull()

  const legitimate = await refresh(app, refresh_token)
  expect(legitimate.status).toBe(200)
})

test('consenting again updates the connection rather than adding one', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  await consent(app)
  const second = await consent(app)

  const grants = await getGrants(app.clientId)
  expect(grants).toHaveLength(1)
  expect(grants[0]!.revokedAt).toBeNull()
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: second.access_token})
  expect(viewer.data.viewer.id).toBe(admin.userId)
})

test('an access token stops working as soon as its connection is revoked', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  const {access_token} = await consent(app)
  expect(await getViewerErrorCode(access_token)).toBeUndefined()

  await getKysely()
    .updateTable('OAuthAPIGrant')
    .set({revokedAt: new Date()})
    .where('clientId', '=', app.clientId)
    .execute()

  expect(await getViewerErrorCode(access_token)).toBe('UNAUTHENTICATED')
})

test('an access token from before grants existed is refused', async () => {
  const admin = await createOrgAdmin()
  const app = await createApp(admin)
  const legacyToken = encodeAuthToken(
    new AuthToken({
      aud: 'action-oauth2',
      client_id: app.clientId,
      sub: admin.userId,
      tms: [],
      scope: ['users:read']
    })
  )
  expect(await getViewerErrorCode(legacyToken)).toBe('UNAUTHENTICATED')
})
