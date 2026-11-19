import crypto from 'crypto'
import faker from 'faker'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import hashRandomToken from '../utils/hashRandomToken'
import {createOrgAdmin, getTestEmail, HOST, PROTOCOL, sendIntranet, sendPublic} from './common'

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
      provider {
        id
      }
      clientId
    }
  }
`

const UPDATE_OAUTH_API_PROVIDER_SCOPES = `
  mutation UpdateOAuthAPIProviderScopes($providerId: ID!, $scopes: [OAuthScopeEnum!]) {
    updateOAuthAPIProvider(providerId: $providerId, scopes: $scopes) {
      provider {
        id
      }
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

const INVALIDATE_SESSIONS = `
  mutation InvalidateSessions {
    invalidateSessions {
      __typename
    }
  }
`

const PRUNE_PG = `
  mutation PrunePG($before: DateTime!) {
    prunePG(before: $before)
  }
`

const VIEWER_ID = `
  query ViewerId {
    viewer {
      id
    }
  }
`

interface App {
  cookie: string
  providerId: string
  clientId: string
  redirectUri: string
}

const createApp = async (
  admin: {cookie: string; orgId: string},
  scopes = ['USERS_READ']
): Promise<App> => {
  const {cookie, orgId} = admin
  const redirectUri = `https://${faker.internet.domainName()}/${faker.internet.domainWord()}`
  const created = await sendPublic({
    query: CREATE_OAUTH_API_PROVIDER,
    variables: {orgId, name: 'Grant test app', redirectUris: [redirectUri], scopes},
    cookie
  })
  expect(created.errors).toBeUndefined()
  const {clientId, provider} = created.data.createOAuthAPIProvider
  return {cookie, providerId: provider.id, clientId, redirectUri}
}

const postToken = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params)
  })

const getCode = async (app: App, codeChallenge: string, scope = 'users:read') => {
  const {cookie, clientId, redirectUri} = app
  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {
      request: {
        clientId,
        redirectUri,
        scope,
        state: 'xyz',
        codeChallenge,
        codeChallengeMethod: 'S256'
      }
    },
    cookie
  })
  expect(approved.errors).toBeUndefined()
  return new URL(approved.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
}

const consent = async (app: App, scope?: string) => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const response = await postToken({
    grant_type: 'authorization_code',
    code: await getCode(app, codeChallenge, scope),
    redirect_uri: app.redirectUri,
    client_id: app.clientId,
    code_verifier: codeVerifier
  })
  expect(response.status).toBe(200)
  return response.json()
}

const refresh = (app: App, refreshToken: string) =>
  postToken({grant_type: 'refresh_token', refresh_token: refreshToken, client_id: app.clientId})

const getGrants = (clientId: string) =>
  getKysely().selectFrom('OAuthAPIGrant').select('id').where('clientId', '=', clientId).execute()

const getViewerErrorCode = async (accessToken: string) => {
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: accessToken})
  return viewer.errors?.[0]?.extensions?.code
}

const ageRotation = (refreshToken: string) =>
  getKysely()
    .updateTable('OAuthAPIRefreshToken')
    .set({rotatedAt: new Date(Date.now() - ms('1m'))})
    .where('tokenHash', '=', hashRandomToken(refreshToken))
    .execute()

const signUpOrgAdmin = () => createOrgAdmin(getTestEmail())

test('the token response carries a refresh token and a one-hour access token', async () => {
  const app = await createApp(await signUpOrgAdmin())
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

test('a refresh token is swapped for new tokens', async () => {
  const admin = await signUpOrgAdmin()
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
})

test('a refresh retried within 30 seconds gets new tokens and keeps the connection', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const first = await consent(app)
  const second = await (await refresh(app, first.refresh_token)).json()

  const retried = await refresh(app, first.refresh_token)
  expect(retried.status).toBe(200)
  const sibling = await retried.json()
  expect(sibling.refresh_token).not.toBe(second.refresh_token)
  expect(await getViewerErrorCode(second.access_token)).toBeUndefined()
  expect(await getViewerErrorCode(sibling.access_token)).toBeUndefined()
  expect(await getGrants(app.clientId)).toHaveLength(1)
})

test('two simultaneous refreshes with one token both succeed', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const {refresh_token} = await consent(app)

  const responses = await Promise.all([refresh(app, refresh_token), refresh(app, refresh_token)])
  expect(responses.map(({status}) => status)).toEqual([200, 200])
  expect(await getGrants(app.clientId)).toHaveLength(1)
})

test('reusing a refresh token after 30 seconds disconnects the app', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const first = await consent(app)
  const second = await (await refresh(app, first.refresh_token)).json()
  expect(await getViewerErrorCode(second.access_token)).toBeUndefined()
  await ageRotation(first.refresh_token)

  const reused = await refresh(app, first.refresh_token)
  expect(reused.status).toBe(400)
  expect(await reused.json()).toMatchObject({error: 'invalid_grant'})

  expect(await getGrants(app.clientId)).toHaveLength(0)
  expect(await getViewerErrorCode(second.access_token)).toBe('UNAUTHENTICATED')
  expect((await refresh(app, second.refresh_token)).status).toBe(400)
})

test('a refresh token only works for its own client', async () => {
  const admin = await signUpOrgAdmin()
  const app = await createApp(admin)
  const otherApp = await createApp(admin)
  const {refresh_token} = await consent(app)

  const stolen = await refresh(otherApp, refresh_token)
  expect(stolen.status).toBe(400)
  expect(await stolen.json()).toMatchObject({error: 'invalid_grant'})
  expect(await getGrants(app.clientId)).toHaveLength(1)

  const legitimate = await refresh(app, refresh_token)
  expect(legitimate.status).toBe(200)
})

test('consenting again updates the connection rather than adding one', async () => {
  const admin = await signUpOrgAdmin()
  const app = await createApp(admin)
  await consent(app)
  const second = await consent(app)

  expect(await getGrants(app.clientId)).toHaveLength(1)
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: second.access_token})
  expect(viewer.data.viewer.id).toBe(admin.userId)
})

test('an access token stops working as soon as its connection is removed', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const {access_token} = await consent(app)
  expect(await getViewerErrorCode(access_token)).toBeUndefined()

  await getKysely().deleteFrom('OAuthAPIGrant').where('clientId', '=', app.clientId).execute()

  expect(await getViewerErrorCode(access_token)).toBe('UNAUTHENTICATED')
})

test('an access token from before grants existed is refused', async () => {
  const admin = await signUpOrgAdmin()
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

test('two devices consenting to the same client keep independent refresh tokens', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const firstDevice = await consent(app)
  const secondDevice = await consent(app)

  const firstRefresh = await refresh(app, firstDevice.refresh_token)
  expect(firstRefresh.status).toBe(200)
  const secondRefresh = await refresh(app, secondDevice.refresh_token)
  expect(secondRefresh.status).toBe(200)

  expect(await getGrants(app.clientId)).toHaveLength(1)
  const {access_token} = await firstRefresh.json()
  expect(await getViewerErrorCode(access_token)).toBeUndefined()
})

test('a made-up refresh token never disconnects anything', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const {refresh_token} = await consent(app)

  const madeUp = await refresh(app, `prt_${crypto.randomBytes(32).toString('base64url')}`)
  expect(madeUp.status).toBe(400)
  expect(await madeUp.json()).toMatchObject({error: 'invalid_grant'})
  expect(await getGrants(app.clientId)).toHaveLength(1)

  const legitimate = await refresh(app, refresh_token)
  expect(legitimate.status).toBe(200)
})

test('reconnecting after a disconnect does not revive old access tokens', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const before = await consent(app)
  const [removedGrant] = await getGrants(app.clientId)
  await getKysely().deleteFrom('OAuthAPIGrant').where('clientId', '=', app.clientId).execute()

  const after = await consent(app)
  expect(await getViewerErrorCode(before.access_token)).toBe('UNAUTHENTICATED')
  expect(await getViewerErrorCode(after.access_token)).toBeUndefined()
  const grants = await getGrants(app.clientId)
  expect(grants).toHaveLength(1)
  expect(grants[0]!.id).not.toBe(removedGrant!.id)
  expect((await refresh(app, before.refresh_token)).status).toBe(400)
})

test('signing out everywhere disconnects every OAuth app', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const tokens = await consent(app)
  expect(await getViewerErrorCode(tokens.access_token)).toBeUndefined()

  const invalidated = await sendPublic({query: INVALIDATE_SESSIONS, cookie: app.cookie})
  expect(invalidated.errors).toBeUndefined()

  expect(await getGrants(app.clientId)).toHaveLength(0)
  expect(await getViewerErrorCode(tokens.access_token)).toBe('UNAUTHENTICATED')
  const refreshed = await refresh(app, tokens.refresh_token)
  expect(refreshed.status).toBe(400)
  expect(await refreshed.json()).toMatchObject({error: 'invalid_grant'})
})

test("leaving the app's organization disconnects it at the next refresh", async () => {
  const admin = await signUpOrgAdmin()
  const app = await createApp(admin)
  const tokens = await consent(app)
  await getKysely()
    .updateTable('OrganizationUser')
    .set({removedAt: new Date()})
    .where('orgId', '=', admin.orgId)
    .where('userId', '=', admin.userId)
    .execute()

  const refreshed = await refresh(app, tokens.refresh_token)
  expect(refreshed.status).toBe(400)
  expect(await refreshed.json()).toMatchObject({error: 'invalid_grant'})
  expect(await getGrants(app.clientId)).toHaveLength(0)
})

test("narrowing an app's scopes takes effect on the next request", async () => {
  const app = await createApp(await signUpOrgAdmin())
  const {access_token} = await consent(app)
  expect(await getViewerErrorCode(access_token)).toBeUndefined()

  const narrowed = await sendPublic({
    query: UPDATE_OAUTH_API_PROVIDER_SCOPES,
    variables: {providerId: app.providerId, scopes: ['TEAMS_READ']},
    cookie: app.cookie
  })
  expect(narrowed.errors).toBeUndefined()

  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: access_token})
  expect(viewer.errors?.[0]).toMatchObject({
    message: 'Access token is missing required scope: users:read',
    extensions: {code: 'FORBIDDEN'}
  })
})

test("a refresh after narrowing an app's scopes only carries the scopes it still allows", async () => {
  const app = await createApp(await signUpOrgAdmin(), ['USERS_READ', 'TEAMS_READ'])
  const first = await consent(app, 'users:read teams:read')
  expect(first.scope).toBe('users:read teams:read')

  const narrowed = await sendPublic({
    query: UPDATE_OAUTH_API_PROVIDER_SCOPES,
    variables: {providerId: app.providerId, scopes: ['TEAMS_READ']},
    cookie: app.cookie
  })
  expect(narrowed.errors).toBeUndefined()

  const refreshed = await refresh(app, first.refresh_token)
  expect(refreshed.status).toBe(200)
  const second = await refreshed.json()
  expect(second.scope).toBe('teams:read')
  const authToken = getVerifiedAuthToken(second.access_token, true, 'action-oauth2')!
  expect(authToken.scope).toEqual(['teams:read'])
})

test('the prune job deletes expired refresh tokens and authorization codes', async () => {
  const app = await createApp(await signUpOrgAdmin())
  const tokens = await consent(app)
  const abandonedCode = await getCode(
    app,
    crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('base64url')
  )
  const expiredAt = new Date(Date.now() - ms('1d'))
  await getKysely()
    .updateTable('OAuthAPIRefreshToken')
    .set({expiresAt: expiredAt})
    .where('tokenHash', '=', hashRandomToken(tokens.refresh_token))
    .execute()
  await getKysely()
    .updateTable('OAuthAPICode')
    .set({expiresAt: expiredAt})
    .where('id', '=', abandonedCode)
    .execute()

  const pruned = await sendIntranet({query: PRUNE_PG, variables: {before: expiredAt.toJSON()}})
  expect(pruned.errors).toBeUndefined()
  expect(pruned.data.prunePG).toBeGreaterThanOrEqual(2)

  const remainingTokens = await getKysely()
    .selectFrom('OAuthAPIRefreshToken')
    .select('id')
    .where('tokenHash', '=', hashRandomToken(tokens.refresh_token))
    .execute()
  const remainingCodes = await getKysely()
    .selectFrom('OAuthAPICode')
    .select('id')
    .where('id', '=', abandonedCode)
    .execute()
  expect(remainingTokens).toHaveLength(0)
  expect(remainingCodes).toHaveLength(0)
})
