import faker from 'faker'
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
