import appOrigin from '../appOrigin'
import type {DataLoaderWorker} from '../graphql/graphql'
import {selectOAuthAPIProvider} from '../postgres/select'
import type {OAuthAPIProvider} from '../postgres/types'
import type {Oauthscopeenum} from '../postgres/types/pg'
import aiAppScopes from './aiAppScopes'
import fetchClientMetadataDocument from './fetchClientMetadataDocument'
import isRegisteredRedirectUri from './isRegisteredRedirectUri'
import validateClientMetadataDocument, {
  isClientMetadataDocumentUrl
} from './validateClientMetadataDocument'

export interface OAuthAuthorizationRequestParams {
  clientId: string
  redirectUri: string
  scope?: string | null
  state: string
  codeChallenge?: string | null
  codeChallengeMethod?: string | null
  resource?: string | null
}

type AuthorizingProvider = Pick<
  OAuthAPIProvider,
  'clientId' | 'clientType' | 'name' | 'orgId' | 'redirectUris' | 'scopes'
>

type ValidationResult =
  | {error: string; code: 'BAD_USER_INPUT' | 'FORBIDDEN'}
  | {provider: AuthorizingProvider; scopes: Oauthscopeenum[]; isMetadataDocumentClient: boolean}

export const MCP_RESOURCE = `${appOrigin}/mcp`

// base64url(SHA-256(code_verifier)) is always 43 characters
const S256_CODE_CHALLENGE = /^[A-Za-z0-9_-]{43}$/

const getMetadataDocumentProvider = async (
  clientId: string,
  redirectUri: string
): Promise<AuthorizingProvider | {error: string}> => {
  if (!isClientMetadataDocumentUrl(clientId)) return {error: 'Invalid client_id'}
  const fetched = await fetchClientMetadataDocument(clientId)
  if ('error' in fetched) return fetched
  const metadata = validateClientMetadataDocument(clientId, fetched.document, redirectUri)
  if ('error' in metadata) return metadata
  return {
    clientId,
    clientType: 'public',
    name: metadata.clientName,
    orgId: null,
    redirectUris: metadata.redirectUris,
    scopes: aiAppScopes
  }
}

export const validateOAuthAuthorizationRequest = async (
  request: OAuthAuthorizationRequestParams,
  userId: string,
  dataLoader: DataLoaderWorker
): Promise<ValidationResult> => {
  const {clientId, redirectUri, scope, state, codeChallenge, codeChallengeMethod, resource} =
    request
  const storedProvider = await selectOAuthAPIProvider()
    .where('clientId', '=', clientId)
    .executeTakeFirst()
  const isMetadataDocumentClient = clientId.startsWith('https://') && !storedProvider?.verifiedAt
  const provider = isMetadataDocumentClient
    ? await getMetadataDocumentProvider(clientId, redirectUri)
    : storedProvider
  if (!provider) return {error: 'Invalid client_id', code: 'BAD_USER_INPUT'}
  if ('error' in provider) return {error: provider.error, code: 'BAD_USER_INPUT'}
  if (!isRegisteredRedirectUri(provider, redirectUri)) {
    return {
      error: 'Invalid redirect_uri: it is not registered for this client',
      code: 'BAD_USER_INPUT'
    }
  }
  const requestedScopes = [...new Set(scope?.split(' ').filter(Boolean))]
  const isGlobal = !provider.orgId
  if (
    !isGlobal &&
    requestedScopes.some((requestedScope) => !provider.scopes.includes(requestedScope))
  ) {
    return {
      error: 'Invalid scope: this client is not allowed to ask for every requested scope',
      code: 'BAD_USER_INPUT'
    }
  }
  const scopes =
    isGlobal && requestedScopes.length === 0
      ? provider.scopes
      : requestedScopes.filter((requestedScope) => provider.scopes.includes(requestedScope))
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
  if (provider.orgId) {
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({orgId: provider.orgId, userId})
    if (!organizationUser) {
      return {
        error: 'Only members of the organization that registered this client can authorize it',
        code: 'FORBIDDEN'
      }
    }
  }
  return {provider, scopes: scopes as Oauthscopeenum[], isMetadataDocumentClient}
}
