import generateUID from '../generateUID'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {getUserTeams, HOST, PROTOCOL, sendPublic, signUp} from './common'
import {createClient, createCode, createPKCEPair, type ResourceGrants} from './oauthClient'

const AUTHORIZE_URL = `${PROTOCOL}://${HOST}/oauth/authorize`
const TOKEN_URL = `${PROTOCOL}://${HOST}/oauth/token`

const OAUTH_AUTHORIZATION_REQUEST = `
  query OAuthAuthorizationRequest($request: OAuthAuthorizationRequestInput!) {
    viewer {
      oauthAuthorizationRequest(request: $request) {
        name
        scopes
        redirectUri
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

const VIEWER_TEAMS = `
  query ViewerTeams {
    viewer {
      id
      teams {
        id
      }
    }
  }
`

const UPDATE_USER_PROFILE = `
  mutation UpdateUserProfile($updatedUser: UpdateUserProfileInput!) {
    updateUserProfile(updatedUser: $updatedUser) {
      user {
        preferredName
      }
    }
  }
`

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

const REFRESH_SESSION = `
  mutation RefreshSession {
    refreshSession
  }
`

const INVALIDATE_SESSIONS = `
  mutation InvalidateSessions {
    invalidateSessions {
      __typename
    }
  }
`

const DELETE_USER = `
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
      user {
        id
      }
    }
  }
`

const ADD_ORG = `
  mutation AddOrg($newTeam: NewTeamInput!, $orgName: String!) {
    addOrg(newTeam: $newTeam, orgName: $orgName) {
      team {
        id
        orgId
      }
    }
  }
`

const ADD_TEAM = `
  mutation AddTeam($newTeam: NewTeamInput!) {
    addTeam(newTeam: $newTeam) {
      team {
        id
      }
    }
  }
`

const VIEWER_TEAM_IDS = `
  query ViewerTeamIds {
    viewer {
      tms
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

const VIEWER_PERSONAL_ACCESS_TOKENS = `
  query ViewerPersonalAccessTokens {
    viewer {
      personalAccessTokens {
        id
      }
    }
  }
`

const ACCEPT_TEAM_INVITATION = `
  mutation AcceptTeamInvitation($invitationToken: ID!) {
    acceptTeamInvitation(invitationToken: $invitationToken) {
      team {
        id
      }
    }
  }
`

const MOVE_TEAM_TO_ORG = `
  mutation MoveTeamToOrg($teamIds: [ID!]!, $orgId: ID!) {
    moveTeamToOrg(teamIds: $teamIds, orgId: $orgId)
  }
`

const REMOVE_TEAM_MEMBER = `
  mutation RemoveTeamMember($teamId: ID!, $userId: ID!) {
    removeTeamMember(teamId: $teamId, userId: $userId) {
      __typename
    }
  }
`

const defaultPKCEPair = createPKCEPair()

interface AuthorizationRequest {
  clientId: string
  redirectUri: string
  scope: string
  state?: string
  codeChallenge?: string
  codeChallengeMethod?: string
}

const getAuthorizeUrl = (request: AuthorizationRequest) => {
  const {
    clientId,
    redirectUri,
    scope,
    state,
    codeChallenge = defaultPKCEPair.codeChallenge,
    codeChallengeMethod = 'S256'
  } = request
  const authorizeUrl = new URL(AUTHORIZE_URL)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', scope)
  if (state) authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  authorizeUrl.searchParams.set('code_challenge_method', codeChallengeMethod)
  return authorizeUrl
}

const requestAuthorization = (request: AuthorizationRequest, cookie: string) =>
  fetch(getAuthorizeUrl(request), {headers: {cookie}, redirect: 'manual'})

const approve = async (
  request: AuthorizationRequest,
  cookie: string,
  consented: ResourceGrants & {scopes?: string[]} = {}
) => {
  const state = request.state ?? 'xyz'
  const authorizeResponse = await requestAuthorization({...request, state}, cookie)
  expect(authorizeResponse.status).toBe(302)
  const consentUrl = new URL(authorizeResponse.headers.get('Location')!)
  expect(consentUrl.pathname).toBe('/authorize-app')
  expect(consentUrl.searchParams.get('code')).toBeNull()
  expect(consentUrl.searchParams.get('client_id')).toBe(request.clientId)

  const {codeChallenge = defaultPKCEPair.codeChallenge, codeChallengeMethod = 'S256'} = request
  const approved = await createCode(
    {...request, state, codeChallenge, codeChallengeMethod},
    cookie,
    consented
  )
  expect(approved.errors).toBeUndefined()
  const redirectUrl = new URL(approved.data.createOAuthAPICode.redirectUri)
  expect(redirectUrl.origin + redirectUrl.pathname).toBe(request.redirectUri)
  expect(redirectUrl.searchParams.get('state')).toBe(state)
  const code = redirectUrl.searchParams.get('code')
  expect(code).toEqual(expect.any(String))
  return code!
}

const exchangeCode = (params: Record<string, string>) =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code_verifier: defaultPKCEPair.codeVerifier,
      ...params
    })
  })

const getAccessToken = async (cookie: string, scope: string, grants: ResourceGrants = {}) => {
  const {redirectUri, clientId} = await createClient()
  const code = await approve({clientId, redirectUri, scope}, cookie, grants)
  const tokenResponse = await exchangeCode({code, redirect_uri: redirectUri, client_id: clientId})
  expect(tokenResponse.status).toBe(200)
  const {access_token} = await tokenResponse.json()
  return access_token as string
}

const onlyOrg = (orgId: string) => ({grantedOrgIds: [orgId], grantedTeamIds: []})

const addOrg = async (cookie: string) => {
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  const {id: teamId, orgId} = added.data.addOrg.team
  expect(teamId).toEqual(expect.any(String))
  return {teamId: teamId as string, orgId: orgId as string}
}

test('Register an app and get a token', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()
  const request = {
    clientId,
    redirectUri,
    scope: 'users:read users:write',
    state: 'xyz',
    codeChallenge: defaultPKCEPair.codeChallenge,
    codeChallengeMethod: 'S256'
  }

  const consent = await sendPublic({
    query: OAUTH_AUTHORIZATION_REQUEST,
    variables: {request},
    cookie
  })
  expect(consent).toMatchObject({
    data: {
      viewer: {
        oauthAuthorizationRequest: {
          name: 'Test OAuth App',
          scopes: ['USERS_READ', 'USERS_WRITE'],
          redirectUri
        }
      }
    }
  })

  const authCode = await approve(request, cookie)
  const tokenResponse = await exchangeCode({
    code: authCode,
    redirect_uri: redirectUri,
    client_id: clientId
  })

  expect(tokenResponse.status).toBe(200)
  const tokenBody = await tokenResponse.json()
  expect(tokenBody).toMatchObject({
    access_token: expect.any(String),
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'users:read users:write'
  })

  const token = tokenBody.access_token
  const authObj = getVerifiedAuthToken(token, true, 'action-oauth2')
  expect(authObj).toMatchObject({
    aud: 'action-oauth2',
    scope: ['users:read', 'users:write'],
    client_id: clientId
  })
  expect(getVerifiedAuthToken(token, false)).toBeNull()
})

test('An app that names no scopes is offered every scope', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()
  const consent = await sendPublic({
    query: OAUTH_AUTHORIZATION_REQUEST,
    variables: {
      request: {
        clientId,
        redirectUri,
        state: 'xyz',
        codeChallenge: defaultPKCEPair.codeChallenge,
        codeChallengeMethod: 'S256'
      }
    },
    cookie
  })
  expect(consent.errors).toBeUndefined()
  const {scopes} = consent.data.viewer.oauthAuthorizationRequest
  expect(scopes).toHaveLength(18)
  expect(scopes).toEqual(expect.arrayContaining(['USERS_READ', 'PAGES_WRITE']))
})

test('Scopes Parabol does not have are ignored', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()
  const scope = 'users:read offline_access'
  const consent = await sendPublic({
    query: OAUTH_AUTHORIZATION_REQUEST,
    variables: {
      request: {
        clientId,
        redirectUri,
        scope,
        state: 'xyz',
        codeChallenge: defaultPKCEPair.codeChallenge,
        codeChallengeMethod: 'S256'
      }
    },
    cookie
  })
  expect(consent.errors).toBeUndefined()
  expect(consent.data.viewer.oauthAuthorizationRequest.scopes).toEqual(['USERS_READ'])

  const code = await approve({clientId, redirectUri, scope}, cookie, {scopes: ['USERS_READ']})
  const tokenResponse = await exchangeCode({code, redirect_uri: redirectUri, client_id: clientId})
  expect(tokenResponse.status).toBe(200)
  expect(await tokenResponse.json()).toMatchObject({scope: 'users:read'})
})

test('An app that names only scopes Parabol does not have is offered every scope', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()
  const consent = await sendPublic({
    query: OAUTH_AUTHORIZATION_REQUEST,
    variables: {
      request: {
        clientId,
        redirectUri,
        scope: 'openid offline_access',
        state: 'xyz',
        codeChallenge: defaultPKCEPair.codeChallenge,
        codeChallengeMethod: 'S256'
      }
    },
    cookie
  })
  expect(consent.errors).toBeUndefined()
  expect(consent.data.viewer.oauthAuthorizationRequest.scopes).toHaveLength(18)
})

test('Granting more than 100 of a resource fails', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()
  const approved = await createCode(
    {clientId, redirectUri, scope: 'users:read', codeChallenge: defaultPKCEPair.codeChallenge},
    cookie,
    {grantedOrgIds: Array.from({length: 101}, (_, index) => `org${index}`), grantedTeamIds: []}
  )
  expect(approved.data).toBeNull()
  expect(approved.errors?.[0]).toMatchObject({
    message: 'Cannot grant access to more than 100 organizations',
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test('Browsers may not frame the consent page', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()
  const authorizeResponse = await requestAuthorization(
    {clientId, redirectUri, scope: 'users:read', state: 'xyz'},
    cookie
  )
  const consentUrl = new URL(authorizeResponse.headers.get('Location')!)
  for (const pathname of ['/authorize-app', '/Authorize-App/', '/authorize%2Dapp']) {
    consentUrl.pathname = pathname
    const consentPage = await fetch(consentUrl, {headers: {cookie}})
    expect(consentPage.status).toBe(200)
    expect(consentPage.headers.get('Content-Security-Policy')).toBe("frame-ancestors 'none'")
    expect(consentPage.headers.get('X-Frame-Options')).toBe('DENY')
  }

  const otherPage = await fetch(`${PROTOCOL}://${HOST}/me`, {headers: {cookie}})
  expect(otherPage.status).toBe(200)
  expect(otherPage.headers.get('Content-Security-Policy')).toBeNull()
  expect(otherPage.headers.get('X-Frame-Options')).toBeNull()
})

test('Granting a scope the app did not ask for fails', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()

  const approved = await createCode(
    {clientId, redirectUri, scope: 'users:read', codeChallenge: defaultPKCEPair.codeChallenge},
    cookie,
    {scopes: ['USERS_READ', 'USERS_WRITE']}
  )
  expect(approved.data).toBeNull()
  expect(approved.errors?.[0]).toMatchObject({
    message: 'Invalid scope: the application did not ask for every granted scope',
    extensions: {code: 'BAD_USER_INPUT'}
  })
})

test('Granting no scopes fails', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()

  const approved = await createCode(
    {clientId, redirectUri, scope: 'users:read', codeChallenge: defaultPKCEPair.codeChallenge},
    cookie,
    {scopes: []}
  )
  expect(approved.data).toBeNull()
  expect(approved.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT')
})

test('Granting fewer scopes than the app asked for succeeds', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()

  const authCode = await approve({clientId, redirectUri, scope: 'users:read users:write'}, cookie, {
    scopes: ['USERS_WRITE']
  })

  const tokenResponse = await exchangeCode({
    code: authCode,
    redirect_uri: redirectUri,
    client_id: clientId
  })

  expect(tokenResponse.status).toBe(200)
  const tokenBody = await tokenResponse.json()
  expect(tokenBody).toMatchObject({
    access_token: expect.any(String),
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'users:write'
  })

  const token = tokenBody.access_token
  const authObj = getVerifiedAuthToken(token, true, 'action-oauth2')
  expect(authObj).toMatchObject({
    aud: 'action-oauth2',
    scope: ['users:write']
  })
})

test('Authorization requires state and a signed in session', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()

  const withoutState = await requestAuthorization(
    {clientId, redirectUri, scope: 'users:read'},
    cookie
  )
  expect(withoutState.status).toBe(400)

  const signedOut = await requestAuthorization(
    {clientId, redirectUri, scope: 'users:read', state: 'xyz'},
    ''
  )
  expect(signedOut.status).toBe(302)
  expect(new URL(signedOut.headers.get('Location')!).searchParams.get('redirectTo')).toMatch(
    /^\/oauth\/authorize\?/
  )
})

test('An OAuth access token cannot call a mutation outside its scope', async () => {
  const {cookie, userId} = await signUp()
  const token = await getAccessToken(cookie, 'users:read')

  const viewer = await sendPublic({query: VIEWER_ID, bearerToken: token})
  expect(viewer.data.viewer.id).toBe(userId)

  const updated = await sendPublic({
    query: UPDATE_USER_PROFILE,
    variables: {updatedUser: {preferredName: 'Not allowed'}},
    bearerToken: token
  })
  expect(updated.data?.updateUserProfile ?? null).toBeNull()
  expect(updated.errors?.[0]).toMatchObject({
    message: expect.stringMatching('missing required scope'),
    extensions: {code: 'FORBIDDEN'}
  })
})

test('An OAuth access token only reaches the organizations the viewer granted it', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const otherOrg = await addOrg(cookie)

  const limited = await getAccessToken(cookie, 'users:read teams:read', onlyOrg(orgId))
  const limitedViewer = await sendPublic({query: VIEWER_TEAMS, bearerToken: limited})
  expect(limitedViewer.data.viewer.teams).toEqual([{id: teamId}])

  const unlimited = await getAccessToken(cookie, 'users:read teams:read')
  const unlimitedViewer = await sendPublic({query: VIEWER_TEAMS, bearerToken: unlimited})
  expect(unlimitedViewer.data.viewer.teams).toEqual(
    expect.arrayContaining([{id: teamId}, {id: otherOrg.teamId}])
  )
})

test('An OAuth access token cannot create a personal access token', async () => {
  const {cookie} = await signUp()
  const token = await getAccessToken(cookie, 'users:write')

  const created = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'escalated',
      scopes: ['USERS_WRITE', 'ORGS_WRITE'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    bearerToken: token
  })
  expect(created.data).toBeNull()
  expect(created.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
})

test('An OAuth access token is not a session', async () => {
  const {cookie} = await signUp()
  const token = await getAccessToken(cookie, 'users:read')
  const tokenCookie = `__Host-Http-authToken=${token}`

  const viewer = await sendPublic({query: VIEWER_ID, cookie: tokenCookie})
  expect(viewer.data).toBeNull()
  expect(viewer.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')

  const {redirectUri, clientId} = await createClient()
  const request = {clientId, redirectUri, scope: 'users:read', state: 'xyz'}
  const authorizeResponse = await requestAuthorization(request, tokenCookie)
  expect(authorizeResponse.status).toBe(302)
  expect(new URL(authorizeResponse.headers.get('Location')!).pathname).not.toBe('/authorize-app')

  const approved = await sendPublic({
    query: `
      mutation CreateOAuthAPICode($request: OAuthAuthorizationRequestInput!, $scopes: [OAuthScopeEnum!]!) {
        createOAuthAPICode(request: $request, scopes: $scopes) {
          redirectUri
        }
      }
    `,
    variables: {request, scopes: ['USERS_READ']},
    bearerToken: token
  })
  expect(approved.data).toBeNull()
  expect(approved.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
})

test('PKCE verifier must match the challenge', async () => {
  const {cookie} = await signUp()
  const {redirectUri, clientId} = await createClient()
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const request = {
    clientId,
    redirectUri,
    scope: 'users:read',
    codeChallenge,
    codeChallengeMethod: 'S256'
  }
  const credentials = {redirect_uri: redirectUri, client_id: clientId}

  const plainResponse = await requestAuthorization(
    {...request, codeChallenge: codeVerifier, codeChallengeMethod: 'plain', state: 'xyz'},
    cookie
  )
  expect(plainResponse.status).toBe(400)

  const mismatched = await exchangeCode({
    ...credentials,
    code: await approve(request, cookie),
    code_verifier: createPKCEPair().codeVerifier
  })
  expect(mismatched.status).toBe(400)
  expect(await mismatched.json()).toMatchObject({error: 'invalid_grant'})

  const missing = await exchangeCode({
    ...credentials,
    code: await approve(request, cookie),
    code_verifier: ''
  })
  expect(missing.status).toBe(400)

  const matched = await exchangeCode({
    ...credentials,
    code: await approve(request, cookie),
    code_verifier: codeVerifier
  })
  expect(matched.status).toBe(200)
})

test('A code can only be exchanged by the client it was issued to', async () => {
  const {cookie} = await signUp()
  const victimApp = await createClient()
  const otherApp = await createClient()
  const code = await approve(
    {clientId: victimApp.clientId, redirectUri: victimApp.redirectUri, scope: 'users:read'},
    cookie
  )

  const stolen = await exchangeCode({
    code,
    redirect_uri: victimApp.redirectUri,
    client_id: otherApp.clientId
  })
  expect(stolen.status).toBe(400)

  const legitimate = await exchangeCode({
    code,
    redirect_uri: victimApp.redirectUri,
    client_id: victimApp.clientId
  })
  expect(legitimate.status).toBe(200)
})

test('An OAuth access token cannot be traded for a session', async () => {
  const {cookie, orgId} = await signUp()
  const token = await getAccessToken(cookie, 'users:write teams:write')

  const refreshed = await sendPublic({query: REFRESH_SESSION, bearerToken: token})
  expect(refreshed.data).toBeNull()
  expect(refreshed.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
  expect(refreshed.cookie).toBeUndefined()

  const added = await sendPublic({
    query: ADD_TEAM,
    variables: {newTeam: {name: `Team ${generateUID()}`, orgId, isPublic: false}},
    bearerToken: token
  })
  expect(added.data.addTeam.team.id).toEqual(expect.any(String))
  expect(added.cookie).toBeUndefined()
})

test('An OAuth access token cannot create a team outside the organizations it was granted', async () => {
  const {cookie, orgId} = await signUp()
  const otherOrg = await addOrg(cookie)

  const token = await getAccessToken(cookie, 'teams:write', onlyOrg(orgId))
  const added = await sendPublic({
    query: ADD_TEAM,
    variables: {newTeam: {name: `Team ${generateUID()}`, orgId: otherOrg.orgId, isPublic: false}},
    bearerToken: token
  })
  expect(added.data).toBeNull()
  expect(added.errors).toHaveLength(1)
})

test('An OAuth access token cannot delete its user or end their sessions', async () => {
  const {cookie, userId} = await signUp()
  const token = await getAccessToken(cookie, 'users:write')

  const deleted = await sendPublic({query: DELETE_USER, variables: {userId}, bearerToken: token})
  expect(deleted.data).toBeNull()
  expect(deleted.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const invalidated = await sendPublic({query: INVALIDATE_SESSIONS, bearerToken: token})
  expect(invalidated.data).toBeNull()
  expect(invalidated.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const viewer = await sendPublic({query: VIEWER_ID, cookie})
  expect(viewer.data.viewer.id).toBe(userId)
})

test('An OAuth access token limited to an organization cannot create or join another', async () => {
  const {cookie, orgId} = await signUp()
  const token = await getAccessToken(cookie, 'orgs:write teams:write', onlyOrg(orgId))

  const addedOrg = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    bearerToken: token
  })
  expect(addedOrg.data).toBeNull()
  expect(addedOrg.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const accepted = await sendPublic({
    query: ACCEPT_TEAM_INVITATION,
    variables: {invitationToken: generateUID()},
    bearerToken: token
  })
  expect(accepted.data).toBeNull()
  expect(accepted.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
})

test('An OAuth access token only carries the teams of the organizations it was granted', async () => {
  const {cookie, orgId, teamId} = await signUp()
  await addOrg(cookie)

  const token = await getAccessToken(cookie, 'users:read teams:read', onlyOrg(orgId))
  const viewer = await sendPublic({query: VIEWER_TEAM_IDS, bearerToken: token})
  expect(viewer.data.viewer.tms).toEqual([teamId])
})

test('An OAuth access token cannot read personal access tokens, nor notifications when limited', async () => {
  const {cookie, orgId} = await signUp()
  const token = await getAccessToken(cookie, 'users:read', onlyOrg(orgId))

  const notifications = await sendPublic({query: VIEWER_NOTIFICATIONS, bearerToken: token})
  expect(notifications.data).toBeNull()
  expect(notifications.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const personalAccessTokens = await sendPublic({
    query: VIEWER_PERSONAL_ACCESS_TOKENS,
    bearerToken: token
  })
  expect(personalAccessTokens.data).toBeNull()
  expect(personalAccessTokens.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const unlimited = await getAccessToken(cookie, 'users:read')
  const unlimitedTokens = await sendPublic({
    query: VIEWER_PERSONAL_ACCESS_TOKENS,
    bearerToken: unlimited
  })
  expect(unlimitedTokens.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const asSession = await sendPublic({query: VIEWER_NOTIFICATIONS, cookie})
  expect(asSession.errors).toBeUndefined()
  expect(Array.isArray(asSession.data.viewer.notifications.edges)).toBe(true)
})

test('An OAuth access token cannot take a team or its user out of another organization', async () => {
  const {cookie, orgId, userId} = await signUp()
  const otherOrg = await addOrg(cookie)
  const token = await getAccessToken(cookie, 'orgs:write teams:write', onlyOrg(orgId))

  const moved = await sendPublic({
    query: MOVE_TEAM_TO_ORG,
    variables: {teamIds: [otherOrg.teamId], orgId},
    bearerToken: token
  })
  expect(moved.data.moveTeamToOrg).toBe('')

  const removed = await sendPublic({
    query: REMOVE_TEAM_MEMBER,
    variables: {teamId: otherOrg.teamId, userId},
    bearerToken: token
  })
  expect(removed.data?.removeTeamMember ?? null).toBeNull()
  expect(removed.errors).toHaveLength(1)

  const teams = await getUserTeams(userId)
  expect(teams).toContainEqual({id: otherOrg.teamId})
})
