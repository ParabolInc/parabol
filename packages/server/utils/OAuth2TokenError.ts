// Codes that refuse the user's grant (revoked, expired, its user deactivated) rather than our client or request, so only the user can fix it, by signing in again.
// Atlassian refuses a revoked or rotated-away refresh token with unauthorized_client instead of RFC 6749's invalid_grant
const DEAD_GRANT_CODES = new Set(['access_denied', 'invalid_grant', 'unauthorized_client'])

// An OAuth2 error a token endpoint answered with. It keeps a plain Error's name, so its fingerprint is the one a plain Error had
export class OAuth2TokenError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

export const isDeadGrant = (error: unknown): error is OAuth2TokenError =>
  error instanceof OAuth2TokenError && DEAD_GRANT_CODES.has(error.code)
