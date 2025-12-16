import {type Oauthscopeenum} from '../postgres/types/pg'

export type OAuthScopeEnum = Oauthscopeenum

export const OAUTH_SCOPES: {[K in OAuthScopeEnum]: K} = {
  'graphql:query': 'graphql:query',
  'graphql:mutation': 'graphql:mutation'
} as const

export const VALID_OAUTH_SCOPES: OAuthScopeEnum[] = Object.values(OAUTH_SCOPES)

export function validateOAuthScopes(scopes: string[]): boolean {
  return scopes.every((scope) => VALID_OAUTH_SCOPES.includes(scope as OAuthScopeEnum))
}
