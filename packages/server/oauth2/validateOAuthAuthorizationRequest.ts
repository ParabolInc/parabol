import appOrigin from '../appOrigin'
import type {DataLoaderWorker} from '../graphql/graphql'
import {selectOAuthAPIProvider} from '../postgres/select'
import type {OAuthAPIProvider} from '../postgres/types'
import type {Oauthscopeenum} from '../postgres/types/pg'

export interface OAuthAuthorizationRequestParams {
  clientId: string
  redirectUri: string
  scope?: string | null
  state: string
  codeChallenge?: string | null
  codeChallengeMethod?: string | null
  resource?: string | null
}

type ValidationResult =
  | {error: string; code: 'BAD_USER_INPUT' | 'FORBIDDEN'}
  | {provider: OAuthAPIProvider; scopes: Oauthscopeenum[]}

export const MCP_RESOURCE = `${appOrigin}/mcp`

// base64url(SHA-256(code_verifier)) is always 43 characters
const S256_CODE_CHALLENGE = /^[A-Za-z0-9_-]{43}$/

const LOOPBACK_HOSTS = ['127.0.0.1', '[::1]', 'localhost']

const withoutLoopbackPort = (uri: string) => {
  try {
    const url = new URL(uri)
    if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.includes(url.hostname)) return null
    url.port = ''
    return url.href
  } catch {
    return null
  }
}

// RFC 8252 §7.3: a native app picks its loopback port at runtime
const isRegisteredRedirectUri = (provider: OAuthAPIProvider, redirectUri: string) => {
  if (provider.redirectUris.includes(redirectUri)) return true
  if (provider.clientType !== 'public') return false
  const requested = withoutLoopbackPort(redirectUri)
  return (
    !!requested &&
    provider.redirectUris.some((registered) => withoutLoopbackPort(registered) === requested)
  )
}

export const validateOAuthAuthorizationRequest = async (
  request: OAuthAuthorizationRequestParams,
  userId: string,
  dataLoader: DataLoaderWorker
): Promise<ValidationResult> => {
  const {clientId, redirectUri, scope, state, codeChallenge, codeChallengeMethod, resource} =
    request
  const provider = await selectOAuthAPIProvider()
    .where('clientId', '=', clientId)
    .executeTakeFirst()
  if (!provider) return {error: 'Invalid client_id', code: 'BAD_USER_INPUT'}
  if (!isRegisteredRedirectUri(provider, redirectUri)) {
    return {
      error: 'Invalid redirect_uri: it is not registered for this client',
      code: 'BAD_USER_INPUT'
    }
  }
  const scopes = [...new Set(scope?.split(' ').filter(Boolean))]
  if (scopes.some((requestedScope) => !provider.scopes.includes(requestedScope))) {
    return {
      error: 'Invalid scope: this client is not allowed to ask for every requested scope',
      code: 'BAD_USER_INPUT'
    }
  }
  if (!state) return {error: 'Invalid state: state is required', code: 'BAD_USER_INPUT'}
  if (provider.clientType === 'public' && !codeChallenge) {
    return {
      error: 'Invalid code_challenge: public clients must use PKCE',
      code: 'BAD_USER_INPUT'
    }
  }
  if (codeChallenge || codeChallengeMethod) {
    if (codeChallengeMethod !== 'S256') {
      return {
        error: 'Invalid code_challenge_method: only S256 is supported',
        code: 'BAD_USER_INPUT'
      }
    }
    if (!codeChallenge || !S256_CODE_CHALLENGE.test(codeChallenge)) {
      return {error: 'Invalid code_challenge', code: 'BAD_USER_INPUT'}
    }
  }
  if (resource && resource !== MCP_RESOURCE) {
    return {error: 'Invalid resource: only <origin>/mcp is served', code: 'BAD_USER_INPUT'}
  }
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({orgId: provider.orgId, userId})
  if (!organizationUser) {
    return {
      error: 'Only members of the organization that registered this client can authorize it',
      code: 'FORBIDDEN'
    }
  }
  return {provider, scopes: scopes as Oauthscopeenum[]}
}
