import type Atmosphere from '../../../Atmosphere'
import handleAuthenticationRedirect from '../handleAuthenticationRedirect'

const acceptedInvitation = {
  userErrors: [],
  meetingId: null,
  team: {id: 'team-1', activeMeetings: []}
}

describe('handleAuthenticationRedirect', () => {
  it.each([
    ['/team-invitation/token-1', true],
    ['/invitation-link/token-1', true],
    ['/', false],
    ['/meetings', false]
  ])('redirects from %s with replace: %s', (pathname, replace) => {
    Object.assign(globalThis, {window: {location: new URL(pathname, 'https://parabol.test')}})
    const navigate = jest.fn()
    handleAuthenticationRedirect(acceptedInvitation, {atmosphere: {} as Atmosphere, navigate})
    expect(navigate.mock.calls).toEqual([['/team/team-1', {replace}]])
  })
})
