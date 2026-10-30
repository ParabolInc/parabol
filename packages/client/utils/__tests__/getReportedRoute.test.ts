import getReportedRoute from '../getReportedRoute'

test('hides the tokens in verification, invitation and password reset links', () => {
  expect(getReportedRoute('/verify-email/abc/def')).toBe('/verify-email/<token>')
  expect(getReportedRoute('/reset-password/abc')).toBe('/reset-password/<token>')
  expect(getReportedRoute('/team-invitation/abc')).toBe('/team-invitation/<token>')
  expect(getReportedRoute('/invitation-link/abc')).toBe('/invitation-link/<token>')
})

test('keeps every other route as it is', () => {
  expect(getReportedRoute('/meet/abc123/discuss/1')).toBe('/meet/abc123/discuss/1')
  expect(getReportedRoute('/reset-passwords')).toBe('/reset-passwords')
})
