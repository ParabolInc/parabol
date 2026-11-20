import crypto from 'crypto'
import faker from 'faker'
import {HOST, PROTOCOL, sendPublic} from './common'

export const REGISTER_URL = `${PROTOCOL}://${HOST}/oauth/register`

const CREATE_OAUTH_API_CODE = `
  mutation CreateOAuthAPICode(
    $request: OAuthAuthorizationRequestInput!
    $scopes: [OAuthScopeEnum!]!
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
  ) {
    createOAuthAPICode(
      request: $request
      scopes: $scopes
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
    ) {
      redirectUri
    }
  }
`

export interface ResourceGrants {
  grantedOrgIds?: string[] | null
  grantedTeamIds?: string[] | null
  grantedPageIds?: string[] | null
}

export interface AuthorizationRequest {
  clientId: string
  redirectUri: string
  scope?: string | null
  state?: string
  codeChallenge?: string
  codeChallengeMethod?: string
  resource?: string
}

// the scope users:read is USERS_READ in GraphQL
export const toScopeEnums = (scope: string) =>
  scope
    .split(' ')
    .filter(Boolean)
    .map((name) => name.replace(':', '_').toUpperCase())

export const getTestRedirectUri = () =>
  `https://${faker.internet.domainName()}/${faker.internet.domainWord()}`

export const registerClient = (metadata: unknown) =>
  fetch(REGISTER_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(metadata)
  })

export const createClient = async (redirectUri = getTestRedirectUri()) => {
  const registered = await registerClient({
    client_name: 'Test OAuth App',
    redirect_uris: [redirectUri]
  })
  expect(registered.status).toBe(201)
  const {client_id: clientId} = await registered.json()
  return {clientId: clientId as string, redirectUri}
}

export const createPKCEPair = () => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  return {codeVerifier, codeChallenge}
}

// the viewer approves on the consent page, granting every requested scope unless told otherwise
export const createCode = (
  request: AuthorizationRequest,
  cookie: string,
  {scopes, ...grants}: ResourceGrants & {scopes?: string[]} = {}
) =>
  sendPublic({
    query: CREATE_OAUTH_API_CODE,
    variables: {
      request: {
        ...request,
        state: request.state ?? 'xyz',
        codeChallengeMethod:
          request.codeChallengeMethod ?? (request.codeChallenge ? 'S256' : undefined)
      },
      scopes: scopes ?? toScopeEnums(request.scope ?? ''),
      ...grants
    },
    cookie
  })
