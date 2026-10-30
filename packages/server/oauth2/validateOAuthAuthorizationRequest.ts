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
}

type ValidationResult = {error: string} | {provider: OAuthAPIProvider; scopes: Oauthscopeenum[]}

// base64url(SHA-256(code_verifier)) is always 43 characters
const S256_CODE_CHALLENGE = /^[A-Za-z0-9_-]{43}$/

export const validateOAuthAuthorizationRequest = async (
  request: OAuthAuthorizationRequestParams,
  userId: string,
  dataLoader: DataLoaderWorker
): Promise<ValidationResult> => {
  const {clientId, redirectUri, scope, state, codeChallenge, codeChallengeMethod} = request
  const provider = await selectOAuthAPIProvider()
    .where('clientId', '=', clientId)
    .executeTakeFirst()
  if (!provider) return {error: 'Invalid client_id'}
  if (!provider.redirectUris.includes(redirectUri)) {
    return {error: 'Invalid redirect_uri: it is not registered for this client'}
  }
  const scopes = [...new Set(scope?.split(' ').filter(Boolean))]
  if (scopes.some((requestedScope) => !provider.scopes.includes(requestedScope))) {
    return {error: 'Invalid scope: this client is not allowed to ask for every requested scope'}
  }
  if (!state) return {error: 'Invalid state: state is required'}
  if (codeChallenge || codeChallengeMethod) {
    if (codeChallengeMethod !== 'S256') {
      return {error: 'Invalid code_challenge_method: only S256 is supported'}
    }
    if (!codeChallenge || !S256_CODE_CHALLENGE.test(codeChallenge)) {
      return {error: 'Invalid code_challenge'}
    }
  }
  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({orgId: provider.orgId, userId})
  if (!organizationUser) {
    return {error: 'Only members of the organization that registered this client can authorize it'}
  }
  return {provider, scopes: scopes as Oauthscopeenum[]}
}
