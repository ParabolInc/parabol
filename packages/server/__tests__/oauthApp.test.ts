import faker from 'faker'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {HOST, PROTOCOL, sendIntranet, sendPublic, signUp} from './common'

const AUTHORIZE_URL = `${PROTOCOL}://${HOST}/oauth/authorize`
const TOKEN_URL = `${PROTOCOL}://${HOST}/oauth/token`

const createOrgAdmin = async () => {
  const {userId, cookie, orgId} = await signUp()
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

  return {cookie, orgId, userId}
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
      scopes: scopes.map((scope) => scope.replace(':', '_'))
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

  const {clientId, clientSecret} = oauthApp.data.createOAuthAPIProvider
  return {clientId, clientSecret, redirectUri}
}

test('Create app and token', async () => {
  const {cookie, orgId} = await createOrgAdmin()

  const {redirectUri, clientId, clientSecret} = await createAppWithScope({
    orgId,
    cookie,
    scopes: ['graphql:query', 'graphql:mutation']
  })

  const authorizeUrl = new URL(AUTHORIZE_URL)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', 'graphql:query graphql:mutation')
  authorizeUrl.searchParams.set('state', 'xyz')

  const authCodeResponse = await fetch(authorizeUrl, {
    headers: {
      cookie
    },
    redirect: 'manual'
  })

  expect(authCodeResponse.status).toBe(302)
  const location = authCodeResponse.headers.get('Location')
  expect(location).toBeDefined()
  const redirectUrl = new URL(location!)
  expect(redirectUrl.origin + redirectUrl.pathname).toBe(redirectUri)
  const authCode = redirectUrl.searchParams.get('code')
  const state = redirectUrl.searchParams.get('state')
  expect(state).toBe('xyz')
  expect(authCode).toBeDefined()

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode!,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    })
  })

  expect(tokenResponse.status).toBe(200)
  const tokenBody = await tokenResponse.json()
  expect(tokenBody).toMatchObject({
    access_token: expect.any(String),
    token_type: 'Bearer',
    expires_in: expect.any(Number),
    scope: 'graphql:query graphql:mutation'
  })

  const token = tokenBody.access_token
  const authObj = getVerifiedAuthToken(token)
  expect(authObj).toMatchObject({
    aud: 'action-oauth2',
    scope: ['graphql:query', 'graphql:mutation']
  })
})

test('Request more scope than allowed fails', async () => {
  const {cookie, orgId} = await createOrgAdmin()

  const {redirectUri, clientId} = await createAppWithScope({
    orgId,
    cookie,
    scopes: ['graphql:query']
  })

  const authorizeUrl = new URL(AUTHORIZE_URL)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', 'graphql:query graphql:mutation')
  authorizeUrl.searchParams.set('state', 'xyz')

  const authCodeResponse = await fetch(authorizeUrl, {
    headers: {
      cookie
    },
    redirect: 'manual'
  })

  expect(authCodeResponse.status).toBe(400)
})

test('Request less scope than allowed succeeds', async () => {
  const {cookie, orgId} = await createOrgAdmin()

  const {redirectUri, clientId, clientSecret} = await createAppWithScope({
    orgId,
    cookie,
    scopes: ['graphql:mutation', 'graphql:query']
  })

  const authorizeUrl = new URL(AUTHORIZE_URL)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('scope', 'graphql:mutation')
  authorizeUrl.searchParams.set('state', 'xyz')

  const authCodeResponse = await fetch(authorizeUrl, {
    headers: {
      cookie
    },
    redirect: 'manual'
  })

  expect(authCodeResponse.status).toBe(302)
  const location = authCodeResponse.headers.get('Location')
  expect(location).toBeDefined()
  const redirectUrl = new URL(location!)
  expect(redirectUrl.origin + redirectUrl.pathname).toBe(redirectUri)
  const authCode = redirectUrl.searchParams.get('code')
  const state = redirectUrl.searchParams.get('state')
  expect(state).toBe('xyz')
  expect(authCode).toBeDefined()

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode!,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    })
  })

  expect(tokenResponse.status).toBe(200)
  const tokenBody = await tokenResponse.json()
  expect(tokenBody).toMatchObject({
    access_token: expect.any(String),
    token_type: 'Bearer',
    expires_in: expect.any(Number),
    scope: 'graphql:mutation'
  })

  const token = tokenBody.access_token
  const authObj = getVerifiedAuthToken(token)
  expect(authObj).toMatchObject({
    aud: 'action-oauth2',
    scope: ['graphql:mutation']
  })
})

test('Query and mutation token can run both', async () => {
  const {userId} = await signUp()

  const authToken = new AuthToken({
    sub: userId,
    tms: [],
    scope: ['graphql:query', 'graphql:mutation'],
    lifespan_ms: ms('30d'),
    aud: 'action-oauth2'
  })
  const bearerToken = encodeAuthToken(authToken)

  const queryResponse = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
        }
      }
    `,
    bearerToken
  })

  expect(queryResponse).toMatchObject({
    data: {
      viewer: {
        id: userId
      }
    }
  })

  const mutationResponse = await sendPublic({
    query: `
      mutation UpdateUserProfile($updatedUser: UpdateUserProfileInput!) {
        updateUserProfile(updatedUser: $updatedUser) {
          __typename
        }
      }
    `,
    variables: {
      updatedUser: {
        preferredName: 'New Name'
      }
    },
    bearerToken
  })

  expect(mutationResponse).toMatchObject({
    data: {
      updateUserProfile: {
        __typename: 'UpdateUserProfilePayload'
      }
    }
  })
})

test('Query token cannot run mutations', async () => {
  const {userId} = await signUp()

  const authToken = new AuthToken({
    sub: userId,
    tms: [],
    scope: ['graphql:query'],
    lifespan_ms: ms('30d'),
    aud: 'action-oauth2'
  })
  const bearerToken = encodeAuthToken(authToken)

  const queryResponse = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
        }
      }
    `,
    bearerToken
  })

  expect(queryResponse).toMatchObject({
    data: {
      viewer: {
        id: userId
      }
    }
  })

  const mutationResponse = await sendPublic({
    query: `
      mutation UpdateUserProfile($updatedUser: UpdateUserProfileInput!) {
        updateUserProfile(updatedUser: $updatedUser) {
          __typename
        }
      }
    `,
    variables: {
      updatedUser: {
        preferredName: 'New Name'
      }
    },
    bearerToken
  })

  expect(mutationResponse).toMatchObject({
    errors: [
      {
        message: expect.any(String),
        extensions: {
          code: 'FORBIDDEN'
        }
      }
    ]
  })
})

test('Mutation token cannot run queries', async () => {
  const {userId} = await signUp()

  const authToken = new AuthToken({
    sub: userId,
    tms: [],
    scope: ['graphql:mutation'],
    lifespan_ms: ms('30d'),
    aud: 'action-oauth2'
  })
  const bearerToken = encodeAuthToken(authToken)

  const mutationResponse = await sendPublic({
    query: `
      mutation UpdateUserProfile($updatedUser: UpdateUserProfileInput!) {
        updateUserProfile(updatedUser: $updatedUser) {
          __typename
        }
      }
    `,
    variables: {
      updatedUser: {
        preferredName: 'New Name'
      }
    },
    bearerToken
  })

  expect(mutationResponse).toMatchObject({
    data: {
      updateUserProfile: {
        __typename: 'UpdateUserProfilePayload'
      }
    }
  })

  const queryResponse = await sendPublic({
    query: `
      query Viewer {
        viewer {
          id
        }
      }
    `,
    bearerToken
  })

  expect(queryResponse).toMatchObject({
    errors: [
      {
        message: expect.any(String),
        extensions: {
          code: 'FORBIDDEN'
        }
      }
    ]
  })
})

test('OAuth token cannot run private queries and mutations', async () => {
  const {userId} = await signUp()

  const authToken = new AuthToken({
    sub: userId,
    tms: [],
    scope: ['graphql:query', 'graphql:mutation'],
    lifespan_ms: ms('30d'),
    aud: 'action-oauth2'
  })
  const bearerToken = encodeAuthToken(authToken)

  const queryResponse = await sendPublic({
    query: `
      query PingActionTick {
        pingActionTick
      }
    `,
    bearerToken
  })

  expect(queryResponse).toMatchObject({
    errors: [
      {
        message: 'Not Parabol Admin'
      }
    ],
    data: {
      pingActionTick: null
    }
  })

  const mutationResponse = await sendPublic({
    query: `
      mutation AutopauseUsers {
        autopauseUsers
      }
    `,
    bearerToken
  })

  expect(mutationResponse).toMatchObject({
    errors: [
      {
        message: 'Not Parabol Admin'
      }
    ],
    data: {
      autopauseUsers: null
    }
  })
})
