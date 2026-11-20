import crypto from 'crypto'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import hashRandomToken from '../utils/hashRandomToken'
import {createPage, HOST, PROTOCOL, sendIntranet, sendPublic, signUp} from './common'
import {createClient, createCode, createPKCEPair, type ResourceGrants} from './oauthClient'

const TOKEN_URL = `${PROTOCOL}://${HOST}/oauth/token`

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

const VIEWER_OAUTH_GRANTS = `
  query ViewerOAuthGrants {
    viewer {
      oauthGrants {
        id
        appName
        redirectUris
        scopes
        grantedOrgs {
          id
          name
        }
        grantedTeams {
          id
        }
        grantedPages {
          id
        }
        createdAt
        lastUsedAt
      }
    }
  }
`

const REVOKE_OAUTH_API_GRANT = `
  mutation RevokeOAuthAPIGrant($grantId: ID!) {
    revokeOAuthAPIGrant(grantId: $grantId) {
      user {
        oauthGrants {
          id
        }
      }
    }
  }
`

interface User {
  cookie: string
  userId: string
  orgId: string
}

const createApp = async (user: User) => {
  const {clientId, redirectUri} = await createClient()
  return {...user, clientId, redirectUri}
}

type App = Awaited<ReturnType<typeof createApp>>

const postToken = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(params)
  })

const getCode = async (
  app: App,
  codeChallenge: string,
  scope = 'users:read',
  consented: ResourceGrants & {scopes?: string[]} = {}
) => {
  const {cookie, clientId, redirectUri} = app
  const approved = await createCode(
    {clientId, redirectUri, scope, codeChallenge},
    cookie,
    consented
  )
  expect(approved.errors).toBeUndefined()
  return new URL(approved.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
}

const consent = async (
  app: App,
  scope?: string,
  consented: ResourceGrants & {scopes?: string[]} = {}
) => {
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const response = await postToken({
    grant_type: 'authorization_code',
    code: await getCode(app, codeChallenge, scope, consented),
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

test('the token response carries a refresh token and a one-hour access token', async () => {
  const app = await createApp(await signUp())
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
  const user = await signUp()
  const app = await createApp(user)
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
  expect(viewer.data.viewer.id).toBe(user.userId)
})

test('a refresh retried within 30 seconds gets new tokens and keeps the connection', async () => {
  const app = await createApp(await signUp())
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
  const app = await createApp(await signUp())
  const {refresh_token} = await consent(app)

  const responses = await Promise.all([refresh(app, refresh_token), refresh(app, refresh_token)])
  expect(responses.map(({status}) => status)).toEqual([200, 200])
  expect(await getGrants(app.clientId)).toHaveLength(1)
})

test('reusing a refresh token after 30 seconds disconnects the app', async () => {
  const app = await createApp(await signUp())
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

test('after a retry, using one new refresh token makes the other disconnect the app', async () => {
  const app = await createApp(await signUp())
  const first = await consent(app)
  const second = await (await refresh(app, first.refresh_token)).json()
  const sibling = await (await refresh(app, first.refresh_token)).json()

  const third = await refresh(app, sibling.refresh_token)
  expect(third.status).toBe(200)
  const {access_token} = await third.json()

  const forked = await refresh(app, second.refresh_token)
  expect(forked.status).toBe(400)
  expect(await getGrants(app.clientId)).toHaveLength(0)
  expect(await getViewerErrorCode(access_token)).toBe('UNAUTHENTICATED')
})

test('replaying a refresh token within 30 seconds after its new token was used disconnects the app', async () => {
  const app = await createApp(await signUp())
  const first = await consent(app)
  const second = await (await refresh(app, first.refresh_token)).json()
  const third = await refresh(app, second.refresh_token)
  expect(third.status).toBe(200)
  const {access_token} = await third.json()

  const replayed = await refresh(app, first.refresh_token)
  expect(replayed.status).toBe(400)
  expect(await getGrants(app.clientId)).toHaveLength(0)
  expect(await getViewerErrorCode(access_token)).toBe('UNAUTHENTICATED')
})

test('a refresh token only works for its own client', async () => {
  const user = await signUp()
  const app = await createApp(user)
  const otherApp = await createApp(user)
  const {refresh_token} = await consent(app)

  const stolen = await refresh(otherApp, refresh_token)
  expect(stolen.status).toBe(400)
  expect(await stolen.json()).toMatchObject({error: 'invalid_grant'})
  expect(await getGrants(app.clientId)).toHaveLength(1)

  const legitimate = await refresh(app, refresh_token)
  expect(legitimate.status).toBe(200)
})

test('consenting again updates the connection rather than adding one', async () => {
  const user = await signUp()
  const app = await createApp(user)
  await consent(app)
  const second = await consent(app)

  expect(await getGrants(app.clientId)).toHaveLength(1)
  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: second.access_token})
  expect(viewer.data.viewer.id).toBe(user.userId)
})

test('an access token stops working as soon as its connection is removed', async () => {
  const app = await createApp(await signUp())
  const {access_token} = await consent(app)
  expect(await getViewerErrorCode(access_token)).toBeUndefined()

  await getKysely().deleteFrom('OAuthAPIGrant').where('clientId', '=', app.clientId).execute()

  expect(await getViewerErrorCode(access_token)).toBe('UNAUTHENTICATED')
})

test('an access token from before grants existed is refused', async () => {
  const user = await signUp()
  const app = await createApp(user)
  const legacyToken = encodeAuthToken(
    new AuthToken({
      aud: 'action-oauth2',
      client_id: app.clientId,
      sub: user.userId,
      tms: [],
      scope: ['users:read']
    })
  )
  expect(await getViewerErrorCode(legacyToken)).toBe('UNAUTHENTICATED')
})

test('two devices consenting to the same client keep independent refresh tokens', async () => {
  const app = await createApp(await signUp())
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
  const app = await createApp(await signUp())
  const {refresh_token} = await consent(app)

  const madeUp = await refresh(app, `prt_${crypto.randomBytes(32).toString('base64url')}`)
  expect(madeUp.status).toBe(400)
  expect(await madeUp.json()).toMatchObject({error: 'invalid_grant'})
  expect(await getGrants(app.clientId)).toHaveLength(1)

  const legitimate = await refresh(app, refresh_token)
  expect(legitimate.status).toBe(200)
})

test('reconnecting after a disconnect does not revive old access tokens', async () => {
  const app = await createApp(await signUp())
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
  const app = await createApp(await signUp())
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

test('consenting again with fewer scopes narrows the connection at once', async () => {
  const app = await createApp(await signUp())
  const {access_token} = await consent(app, 'users:read teams:read')
  expect(await getViewerErrorCode(access_token)).toBeUndefined()

  await consent(app, 'users:read teams:read', {scopes: ['TEAMS_READ']})

  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: access_token})
  expect(viewer.errors?.[0]).toMatchObject({
    message: 'Access token is missing required scope: users:read',
    extensions: {code: 'FORBIDDEN'}
  })
})

test('a refresh after narrowing a connection only carries the scopes it still allows', async () => {
  const app = await createApp(await signUp())
  const first = await consent(app, 'users:read teams:read')
  expect(first.scope).toBe('users:read teams:read')

  await consent(app, 'users:read teams:read', {scopes: ['TEAMS_READ']})

  const refreshed = await refresh(app, first.refresh_token)
  expect(refreshed.status).toBe(200)
  const second = await refreshed.json()
  expect(second.scope).toBe('teams:read')
  const authToken = getVerifiedAuthToken(second.access_token, true, 'action-oauth2')!
  expect(authToken.scope).toEqual(['teams:read'])
})

test('the viewer sees the apps they connected and what each can reach', async () => {
  const user = await signUp()
  const app = await createApp(user)
  await consent(app, 'users:read', {grantedOrgIds: [user.orgId], grantedTeamIds: []})

  const listed = await sendPublic({query: VIEWER_OAUTH_GRANTS, cookie: user.cookie})
  expect(listed.errors).toBeUndefined()
  expect(listed.data.viewer.oauthGrants).toEqual([
    {
      id: expect.stringMatching(/^OAuthAPIGrant:/),
      appName: 'Test OAuth App',
      redirectUris: [app.redirectUri],
      scopes: ['USERS_READ'],
      grantedOrgs: [{id: user.orgId, name: expect.any(String)}],
      grantedTeams: [],
      grantedPages: null,
      createdAt: expect.any(String),
      lastUsedAt: null
    }
  ])
})

test('a connected app lists only the orgs, teams and pages the viewer can still reach', async () => {
  const user = await signUp()
  const stranger = await signUp()
  const [pageId, strangersPageId] = await Promise.all([
    createPage(user.cookie),
    createPage(stranger.cookie)
  ])
  const app = await createApp(user)
  await consent(app, 'users:read', {
    grantedOrgIds: [user.orgId, stranger.orgId],
    grantedTeamIds: [user.teamId, stranger.teamId],
    grantedPageIds: [pageId, strangersPageId]
  })

  const listed = await sendPublic({query: VIEWER_OAUTH_GRANTS, cookie: user.cookie})
  expect(listed.errors).toBeUndefined()
  expect(listed.data.viewer.oauthGrants).toMatchObject([
    {
      grantedOrgs: [{id: user.orgId}],
      grantedTeams: [{id: user.teamId}],
      grantedPages: [{id: pageId}]
    }
  ])
})

test('disconnecting an app stops its tokens at once', async () => {
  const user = await signUp()
  const app = await createApp(user)
  const tokens = await consent(app)
  const listed = await sendPublic({query: VIEWER_OAUTH_GRANTS, cookie: user.cookie})
  const [{id: grantId}] = listed.data.viewer.oauthGrants

  const revoked = await sendPublic({
    query: REVOKE_OAUTH_API_GRANT,
    variables: {grantId},
    cookie: user.cookie
  })
  expect(revoked.errors).toBeUndefined()
  expect(revoked.data.revokeOAuthAPIGrant.user.oauthGrants).toEqual([])

  expect(await getGrants(app.clientId)).toHaveLength(0)
  expect(await getViewerErrorCode(tokens.access_token)).toBe('UNAUTHENTICATED')
  expect((await refresh(app, tokens.refresh_token)).status).toBe(400)
})

test("nobody else can disconnect a user's app", async () => {
  const user = await signUp()
  const app = await createApp(user)
  await consent(app)
  const listed = await sendPublic({query: VIEWER_OAUTH_GRANTS, cookie: user.cookie})
  const [{id: grantId}] = listed.data.viewer.oauthGrants
  const stranger = await signUp()

  const revoked = await sendPublic({
    query: REVOKE_OAUTH_API_GRANT,
    variables: {grantId},
    cookie: stranger.cookie
  })
  expect(revoked.data).toBeNull()
  expect(revoked.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect(await getGrants(app.clientId)).toHaveLength(1)
})

test('an OAuth access token cannot list or disconnect connected apps', async () => {
  const user = await signUp()
  const app = await createApp(user)
  const {access_token} = await consent(app, 'users:read users:write')
  const listed = await sendPublic({query: VIEWER_OAUTH_GRANTS, cookie: user.cookie})
  const [{id: grantId}] = listed.data.viewer.oauthGrants

  const listedByApp = await sendPublic({query: VIEWER_OAUTH_GRANTS, bearerToken: access_token})
  expect(listedByApp.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect(listedByApp.data?.viewer?.oauthGrants).toBeUndefined()

  const revokedByApp = await sendPublic({
    query: REVOKE_OAUTH_API_GRANT,
    variables: {grantId},
    bearerToken: access_token
  })
  expect(revokedByApp.data).toBeNull()
  expect(revokedByApp.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect(await getGrants(app.clientId)).toHaveLength(1)
})

test('the prune job deletes expired refresh tokens and authorization codes', async () => {
  const app = await createApp(await signUp())
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
