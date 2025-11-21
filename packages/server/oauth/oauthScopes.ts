/**
 * OAuth 2.0 Scopes
 *
 * Defines the available scopes for OAuth 2.0 API access.
 */

export const OAUTH_SCOPES = {
  GRAPHQL_QUERY: 'graphql:query',
  GRAPHQL_MUTATION: 'graphql:mutation'
} as const

export type OAuthScope = (typeof OAUTH_SCOPES)[keyof typeof OAUTH_SCOPES]

export const VALID_OAUTH_SCOPES = Object.values(OAUTH_SCOPES)

/**
 * Validates a list of scopes against the allowed OAuth scopes
 * @param scopes - Array of scope strings to validate
 * @returns true if all scopes are valid, false otherwise
 */
export function validateOAuthScopes(scopes: string[]): boolean {
  return scopes.every((scope) => VALID_OAUTH_SCOPES.includes(scope as OAuthScope))
}
