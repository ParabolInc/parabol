import crypto from 'crypto'
import faker from 'faker'
import generateUID from '../generateUID'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {getUserTeams, HOST, PROTOCOL, sendIntranet, sendPublic, signUp} from './common'

const AUTHORIZE_URL = `${PROTOCOL}://${HOST}/oauth/authorize`
const TOKEN_URL = `${PROTOCOL}://${HOST}/oauth/token`

const CREATE_OAUTH_API_CODE = `
  mutation CreateOAuthAPICode($request: OAuthAuthorizationRequestInput!) {
    createOAuthAPICode(request: $request) {
      redirectUri
    }
  }
`

const OAUTH_AUTHORIZATION_REQUEST = `
  query OAuthAuthorizationRequest($request: OAuthAuthorizationRequestInput!) {
    viewer {
      oauthAuthorizationRequest(request: $request) {
        name
        scopes
        redirectUri
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
      error {
        message
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
      error {
        message
      }
      team {
        id
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
      error {
        message
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
      error {
        message
      }
    }
  }
`

const createOrgAdmin = async () => {
  const {userId, cookie, orgId, teamId} = await signUp()
  const promoteToOrgAdmin = await sendIntranet({
    query: `
      mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: OrgUserRole) {
        setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
          __typename
          ... on ErrorPayload {
            error {
              message
            }
          }
        }
      }
    `,
    variables: {
      orgId,
      userId,
      role: 'ORG_ADMIN'
    }
  })

  expect(promoteToOrgAdmin).toMatchObject({
    data: {
      setOrgUserRole: {
        __typename: 'SetOrgUserRoleSuccess'
      }
    }
  })

  return {cookie, orgId, userId, teamId}
}

const createAppWithScope = async ({
  orgId,
  cookie,
  scopes
}: {
  orgId: string
  cookie: string
  scopes: string[]
}) => {
  const redirectUri = `https://${faker.internet.domainName()}.${faker.internet.domainSuffix()}/${faker.internet.domainWord()}`
  const oauthApp = await sendPublic({
    query: `
      mutation OAuthAppFormContentCreateMutation(
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
            name
            updatedAt
          }
          clientId
          clientSecret
        }
      }
    `,
    variables: {
      orgId,
      name: 'Test OAuth App',
      redirectUris: [redirectUri],
      scopes: scopes
    },
    cookie
  })
  expect(oauthApp).toMatchObject({
    data: {
      createOAuthAPIProvider: {
        provider: {
          id: expect.anything(),
          name: 'Test OAuth App',
          updatedAt: expect.anything()
        },
        clientId: expect.anything(),
        clientSecret: expect.anything()
      }
    }
  })

  const {clientId, clientSecret, provider} = oauthApp.data.createOAuthAPIProvider
  return {clientId, clientSecret, redirectUri, providerId: provider.id as string}
}

interface AuthorizationRequest {
  clientId: string
  redirectUri: string
  scope: string
  state?: string
  codeChallenge?: string
  codeChallengeMethod?: string
}

const getAuthorizeUrl = (request: AuthorizationRequest) => {
  const {clientId, redirectUri, scope, state, codeChallenge, codeChallengeMethod} = request
  const authorizeUrl = new URL(AUTHORIZE_URL)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', scope)
  if (state) authorizeUrl.searchParams.set('state', state)
  if (codeChallenge) authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  if (codeChallengeMethod) {
    authorizeUrl.searchParams.set('code_challenge_method', codeChallengeMethod)
  }
  return authorizeUrl
}

const requestAuthorization = (request: AuthorizationRequest, cookie: string) =>
  fetch(getAuthorizeUrl(request), {headers: {cookie}, redirect: 'manual'})

const approve = async (request: AuthorizationRequest, cookie: string) => {
  const state = request.state ?? 'xyz'
  const authorizeResponse = await requestAuthorization({...request, state}, cookie)
  expect(authorizeResponse.status).toBe(302)
  const consentUrl = new URL(authorizeResponse.headers.get('Location')!)
  expect(consentUrl.pathname).toBe('/authorize-app')
  expect(consentUrl.searchParams.get('code')).toBeNull()
  expect(consentUrl.searchParams.get('client_id')).toBe(request.clientId)

  const {clientId, redirectUri, scope, codeChallenge, codeChallengeMethod} = request
  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {
      request: {clientId, redirectUri, scope, state, codeChallenge, codeChallengeMethod}
    },
    cookie
  })
  expect(approved.errors).toBeUndefined()
  const redirectUrl = new URL(approved.data.createOAuthAPICode.redirectUri)
  expect(redirectUrl.origin + redirectUrl.pathname).toBe(redirectUri)
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
    body: new URLSearchParams({grant_type: 'authorization_code', ...params})
  })

const getAccessToken = async ({
  orgId,
  cookie,
  scopes,
  scope
}: {
  orgId: string
  cookie: string
  scopes: string[]
  scope: string
}) => {
  const {redirectUri, clientId, clientSecret} = await createAppWithScope({orgId, cookie, scopes})
  const code = await approve({clientId, redirectUri, scope}, cookie)
  const tokenResponse = await exchangeCode({
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  })
  expect(tokenResponse.status).toBe(200)
  const {access_token} = await tokenResponse.json()
  return access_token as string
}

const createPKCEPair = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  return {codeVerifier, codeChallenge}
}

test('Create app and token', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const {redirectUri, clientId, clientSecret} = await createAppWithScope({
    orgId,
    cookie,
    scopes: ['USERS_READ', 'USERS_WRITE']
  })
  const request = {clientId, redirectUri, scope: 'users:read users:write', state: 'xyz'}

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
          redirectUri,
          organization: {id: orgId}
        }
      }
    }
  })

  const authCode = await approve(request, cookie)
  const tokenResponse = await exchangeCode({
    code: authCode,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  })

  expect(tokenResponse.status).toBe(200)
  const tokenBody = await tokenResponse.json()
  expect(tokenBody).toMatchObject({
    access_token: expect.any(String),
    token_type: 'Bearer',
    expires_in: expect.any(Number),
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

test('Request more scope than allowed fails', async () => {
  const {cookie, orgId} = await createOrgAdmin()

  const {redirectUri, clientId} = await createAppWithScope({
    orgId,
    cookie,
    scopes: ['USERS_READ']
  })

  const authCodeResponse = await requestAuthorization(
    {clientId, redirectUri, scope: 'users:read users:write', state: 'xyz'},
    cookie
  )
  expect(authCodeResponse.status).toBe(400)

  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {request: {clientId, redirectUri, scope: 'users:read users:write', state: 'xyz'}},
    cookie
  })
  expect(approved.data).toBeNull()
  expect(approved.errors?.[0]?.message).toMatch('Invalid scope')
})

test('Request less scope than allowed succeeds', async () => {
  const {cookie, orgId} = await createOrgAdmin()

  const {redirectUri, clientId, clientSecret} = await createAppWithScope({
    orgId,
    cookie,
    scopes: ['USERS_READ', 'USERS_WRITE']
  })

  const authCode = await approve({clientId, redirectUri, scope: 'users:write'}, cookie)

  const tokenResponse = await exchangeCode({
    code: authCode,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret
  })

  expect(tokenResponse.status).toBe(200)
  const tokenBody = await tokenResponse.json()
  expect(tokenBody).toMatchObject({
    access_token: expect.any(String),
    token_type: 'Bearer',
    expires_in: expect.any(Number),
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
  const {cookie, orgId} = await createOrgAdmin()
  const {redirectUri, clientId} = await createAppWithScope({orgId, cookie, scopes: ['USERS_READ']})

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

test('Only members of the registering organization can authorize an app', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const {redirectUri, clientId} = await createAppWithScope({orgId, cookie, scopes: ['USERS_READ']})
  const outsider = await signUp()

  const authorizeResponse = await requestAuthorization(
    {clientId, redirectUri, scope: 'users:read', state: 'xyz'},
    outsider.cookie
  )
  expect(authorizeResponse.status).toBe(400)

  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {request: {clientId, redirectUri, scope: 'users:read', state: 'xyz'}},
    cookie: outsider.cookie
  })
  expect(approved.data).toBeNull()
})

test('An OAuth access token cannot call a mutation outside its scope', async () => {
  const {cookie, orgId, userId} = await createOrgAdmin()
  const token = await getAccessToken({orgId, cookie, scopes: ['USERS_READ'], scope: 'users:read'})

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

test('An OAuth access token only reaches the organization that registered the app', async () => {
  const {cookie, orgId, teamId} = await createOrgAdmin()
  const otherOrg = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  const otherTeamId = otherOrg.data.addOrg.team.id
  expect(otherTeamId).toEqual(expect.any(String))

  const token = await getAccessToken({
    orgId,
    cookie,
    scopes: ['USERS_READ', 'TEAMS_READ'],
    scope: 'users:read teams:read'
  })
  const viewer = await sendPublic({query: VIEWER_TEAMS, bearerToken: token})
  expect(viewer.data.viewer.teams).toEqual([{id: teamId}])
})

test('An OAuth access token cannot create a personal access token', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const token = await getAccessToken({orgId, cookie, scopes: ['USERS_WRITE'], scope: 'users:write'})

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
  const {cookie, orgId} = await createOrgAdmin()
  const token = await getAccessToken({orgId, cookie, scopes: ['USERS_READ'], scope: 'users:read'})
  const tokenCookie = `__Host-Http-authToken=${token}`

  const viewer = await sendPublic({query: VIEWER_ID, cookie: tokenCookie})
  expect(viewer.data).toBeNull()
  expect(viewer.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')

  const {redirectUri, clientId} = await createAppWithScope({orgId, cookie, scopes: ['USERS_READ']})
  const request = {clientId, redirectUri, scope: 'users:read', state: 'xyz'}
  const authorizeResponse = await requestAuthorization(request, tokenCookie)
  expect(authorizeResponse.status).toBe(302)
  expect(new URL(authorizeResponse.headers.get('Location')!).pathname).not.toBe('/authorize-app')

  const approved = await sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {request},
    bearerToken: token
  })
  expect(approved.data).toBeNull()
  expect(approved.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
})

test('PKCE verifier must match the challenge', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const {redirectUri, clientId, clientSecret} = await createAppWithScope({
    orgId,
    cookie,
    scopes: ['USERS_READ']
  })
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const request = {
    clientId,
    redirectUri,
    scope: 'users:read',
    codeChallenge,
    codeChallengeMethod: 'S256'
  }
  const credentials = {redirect_uri: redirectUri, client_id: clientId, client_secret: clientSecret}

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

  const missing = await exchangeCode({...credentials, code: await approve(request, cookie)})
  expect(missing.status).toBe(400)

  const matched = await exchangeCode({
    ...credentials,
    code: await approve(request, cookie),
    code_verifier: codeVerifier
  })
  expect(matched.status).toBe(200)

  const unexpectedVerifier = await exchangeCode({
    ...credentials,
    code: await approve({clientId, redirectUri, scope: 'users:read'}, cookie),
    code_verifier: codeVerifier
  })
  expect(unexpectedVerifier.status).toBe(400)
})

test('A code can only be exchanged by the client it was issued to', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const victimApp = await createAppWithScope({orgId, cookie, scopes: ['USERS_READ']})
  const otherApp = await createAppWithScope({orgId, cookie, scopes: ['USERS_READ']})
  const code = await approve(
    {clientId: victimApp.clientId, redirectUri: victimApp.redirectUri, scope: 'users:read'},
    cookie
  )

  const stolen = await exchangeCode({
    code,
    redirect_uri: victimApp.redirectUri,
    client_id: otherApp.clientId,
    client_secret: otherApp.clientSecret
  })
  expect(stolen.status).toBe(400)

  const wrongSecret = await exchangeCode({
    code,
    redirect_uri: victimApp.redirectUri,
    client_id: victimApp.clientId,
    client_secret: otherApp.clientSecret
  })
  expect(wrongSecret.status).toBe(401)

  const legitimate = await exchangeCode({
    code,
    redirect_uri: victimApp.redirectUri,
    client_id: victimApp.clientId,
    client_secret: victimApp.clientSecret
  })
  expect(legitimate.status).toBe(200)
})

test('An OAuth access token cannot be traded for a session', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const token = await getAccessToken({
    orgId,
    cookie,
    scopes: ['USERS_WRITE', 'TEAMS_WRITE'],
    scope: 'users:write teams:write'
  })

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

test('An OAuth access token cannot create a team outside its organization', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const otherOrg = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  const otherOrgId = otherOrg.data.addOrg.team.orgId
  expect(otherOrgId).toEqual(expect.any(String))

  const token = await getAccessToken({orgId, cookie, scopes: ['TEAMS_WRITE'], scope: 'teams:write'})
  const added = await sendPublic({
    query: ADD_TEAM,
    variables: {newTeam: {name: `Team ${generateUID()}`, orgId: otherOrgId, isPublic: false}},
    bearerToken: token
  })
  expect(added.data).toBeNull()
  expect(added.errors).toHaveLength(1)
})

test('An OAuth access token cannot delete its user or end their sessions', async () => {
  const {cookie, orgId, userId} = await createOrgAdmin()
  const token = await getAccessToken({orgId, cookie, scopes: ['USERS_WRITE'], scope: 'users:write'})

  const deleted = await sendPublic({query: DELETE_USER, variables: {userId}, bearerToken: token})
  expect(deleted.data).toBeNull()
  expect(deleted.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const invalidated = await sendPublic({query: INVALIDATE_SESSIONS, bearerToken: token})
  expect(invalidated.data).toBeNull()
  expect(invalidated.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const viewer = await sendPublic({query: VIEWER_ID, cookie})
  expect(viewer.data.viewer.id).toBe(userId)
})

test('An OAuth access token cannot manage OAuth applications', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const {providerId} = await createAppWithScope({orgId, cookie, scopes: ['USERS_READ']})
  const token = await getAccessToken({orgId, cookie, scopes: ['ORGS_WRITE'], scope: 'orgs:write'})

  const regenerated = await sendPublic({
    query: REGENERATE_OAUTH_API_PROVIDER_SECRET,
    variables: {providerId},
    bearerToken: token
  })
  expect(regenerated.data).toBeNull()
  expect(regenerated.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const asSession = await sendPublic({
    query: REGENERATE_OAUTH_API_PROVIDER_SECRET,
    variables: {providerId},
    cookie
  })
  expect(asSession.data.regenerateOAuthAPIProviderSecret.clientSecret).toEqual(expect.any(String))
})

test('An OAuth access token cannot create or join another organization', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const token = await getAccessToken({
    orgId,
    cookie,
    scopes: ['ORGS_WRITE', 'TEAMS_WRITE'],
    scope: 'orgs:write teams:write'
  })

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

test('An OAuth access token only carries the teams of its organization', async () => {
  const {cookie, orgId, teamId} = await createOrgAdmin()
  const otherOrg = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  expect(otherOrg.data.addOrg.team.id).toEqual(expect.any(String))

  const token = await getAccessToken({
    orgId,
    cookie,
    scopes: ['USERS_READ', 'TEAMS_READ'],
    scope: 'users:read teams:read'
  })
  const viewer = await sendPublic({query: VIEWER_TEAM_IDS, bearerToken: token})
  expect(viewer.data.viewer.tms).toEqual([teamId])
})

test('An OAuth access token cannot read notifications or personal access tokens', async () => {
  const {cookie, orgId} = await createOrgAdmin()
  const token = await getAccessToken({orgId, cookie, scopes: ['USERS_READ'], scope: 'users:read'})

  const notifications = await sendPublic({query: VIEWER_NOTIFICATIONS, bearerToken: token})
  expect(notifications.data).toBeNull()
  expect(notifications.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const personalAccessTokens = await sendPublic({
    query: VIEWER_PERSONAL_ACCESS_TOKENS,
    bearerToken: token
  })
  expect(personalAccessTokens.data).toBeNull()
  expect(personalAccessTokens.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const asSession = await sendPublic({query: VIEWER_NOTIFICATIONS, cookie})
  expect(asSession.errors).toBeUndefined()
  expect(Array.isArray(asSession.data.viewer.notifications.edges)).toBe(true)
})

test('An OAuth access token cannot take a team or its user out of another organization', async () => {
  const {cookie, orgId, userId} = await createOrgAdmin()
  const otherOrg = await sendPublic({
    query: ADD_ORG,
    variables: {
      newTeam: {name: `Team ${generateUID()}`, orgId: '', isPublic: false},
      orgName: `Org ${generateUID()}`
    },
    cookie
  })
  const otherTeamId = otherOrg.data.addOrg.team.id
  const token = await getAccessToken({
    orgId,
    cookie,
    scopes: ['ORGS_WRITE', 'TEAMS_WRITE'],
    scope: 'orgs:write teams:write'
  })

  const moved = await sendPublic({
    query: MOVE_TEAM_TO_ORG,
    variables: {teamIds: [otherTeamId], orgId},
    bearerToken: token
  })
  expect(moved.data.moveTeamToOrg).toBe('')

  const removed = await sendPublic({
    query: REMOVE_TEAM_MEMBER,
    variables: {teamId: otherTeamId, userId},
    bearerToken: token
  })
  expect(removed.data?.removeTeamMember ?? null).toBeNull()
  expect(removed.errors).toHaveLength(1)

  const teams = await getUserTeams(userId)
  expect(teams).toContainEqual({id: otherTeamId})
})
