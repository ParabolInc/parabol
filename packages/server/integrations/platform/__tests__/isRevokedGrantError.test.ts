import isRevokedGrantError from '../isRevokedGrantError'

describe('isRevokedGrantError', () => {
  it.each([
    'refresh_token is invalid',
    'invalid_grant',
    'Token has been expired or revoked.',
    'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.'
  ])('is true for %s', (message) => {
    expect(isRevokedGrantError(new Error(message))).toBe(true)
  })

  it.each([
    'invalid_client',
    'unauthorized_client',
    'Received non-JSON OAuth2 Response',
    'fetch failed',
    'Atlassian did not grant offline access'
  ])('is false for %s', (message) => {
    expect(isRevokedGrantError(new Error(message))).toBe(false)
  })
})
