export const OAUTH_SCOPES = {
  GRAPHQL_QUERY: 'graphql:query',
  GRAPHQL_MUTATION: 'graphql:mutation'
} as const

export type OAuthScopeEnum = (typeof OAUTH_SCOPES)[keyof typeof OAUTH_SCOPES]

export const VALID_OAUTH_SCOPES = Object.values(OAUTH_SCOPES)

export function validateOAuthScopes(scopes: string[]): boolean {
  return scopes.every((scope) => VALID_OAUTH_SCOPES.includes(scope as OAuthScopeEnum))
}
