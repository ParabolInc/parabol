import isLoopbackHostname from '../../client/utils/isLoopbackHostname'
import appOrigin from '../appOrigin'
import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
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
  | {error: string; code: 'BAD_USER_INPUT'}
  | {provider: OAuthAPIProvider; scopes: Oauthscopeenum[]; codeChallenge: string}

const ALL_SCOPES: string[] = Object.values(OAuthScopeEnum)

export const MCP_RESOURCE = `${appOrigin}/mcp`

// base64url(SHA-256(code_verifier)) is always 43 characters
const S256_CODE_CHALLENGE = /^[A-Za-z0-9_-]{43}$/

const withoutLoopbackPort = (uri: string) => {
  try {
    const url = new URL(uri)
    if (url.protocol !== 'http:' || !isLoopbackHostname(url.hostname)) return null
    url.port = ''
    return url.href
  } catch {
    return null
  }
}

// RFC 8252 §7.3: a native app picks its loopback port at runtime
const isRegisteredRedirectUri = (provider: OAuthAPIProvider, redirectUri: string) => {
  if (provider.redirectUris.includes(redirectUri)) return true
  const requested = withoutLoopbackPort(redirectUri)
  return (
    !!requested &&
    provider.redirectUris.some((registered) => withoutLoopbackPort(registered) === requested)
  )
}

export const validateOAuthAuthorizationRequest = async (
  request: OAuthAuthorizationRequestParams
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
  // RFC 6749 §3.3 lets a server ignore scopes it does not have, like OpenID Connect's offline_access
  const requestedScopes = [
    ...new Set(scope?.split(' ').filter((requestedScope) => ALL_SCOPES.includes(requestedScope)))
  ]
  // an app that asks for nothing Parabol has is offered every scope, and the viewer picks
  const scopes = requestedScopes.length > 0 ? requestedScopes : ALL_SCOPES
  if (!state) return {error: 'Invalid state: state is required', code: 'BAD_USER_INPUT'}
  if (!codeChallenge) {
    return {error: 'Invalid code_challenge: PKCE is required', code: 'BAD_USER_INPUT'}
  }
  if (codeChallengeMethod !== 'S256') {
    return {
      error: 'Invalid code_challenge_method: only S256 is supported',
      code: 'BAD_USER_INPUT'
    }
  }
  if (!S256_CODE_CHALLENGE.test(codeChallenge)) {
    return {error: 'Invalid code_challenge', code: 'BAD_USER_INPUT'}
  }
  if (resource && resource !== MCP_RESOURCE) {
    return {error: 'Invalid resource: only <origin>/mcp is served', code: 'BAD_USER_INPUT'}
  }
  return {provider, scopes: scopes as Oauthscopeenum[], codeChallenge}
}
