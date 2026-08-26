const REVOKED_GRANT_PATTERN =
  /invalid_grant|refresh_token is invalid|expired or revoked|invalid, expired, revoked/i

const isRevokedGrantError = (error: Error) => REVOKED_GRANT_PATTERN.test(error.message)

export default isRevokedGrantError
