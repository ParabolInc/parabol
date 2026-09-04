jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))
jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))

import {fetch} from '@whatwg-node/fetch'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import GmeetOAuth2Manager from '../GmeetOAuth2Manager'

const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

describe('GmeetOAuth2Manager.authorize', () => {
  const manager = new GmeetOAuth2Manager('cid', 'secret', 'https://oauth2.googleapis.com')

  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'ya29',
      refreshToken: 'r',
      scopes: 'openid',
      expiresIn: 3599
    })
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({sub: '1234567890'})
    } as unknown as Response)
  })

  it('returns the openid subject as providerUserId', async () => {
    await expect(manager.authorize('code')).resolves.toMatchObject({
      accessToken: 'ya29',
      refreshToken: 'r',
      providerUserId: '1234567890'
    })
    expect(mockedFetch).toHaveBeenCalledWith('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {Authorization: 'Bearer ya29'}
    })
  })

  it('returns the tokens with providerUserId null when the userinfo lookup fails', async () => {
    mockedFetch.mockResolvedValue({ok: false, status: 403} as unknown as Response)
    await expect(manager.authorize('code')).resolves.toMatchObject({
      accessToken: 'ya29',
      refreshToken: 'r',
      providerUserId: null
    })
  })

  it('returns the tokens with providerUserId null when userinfo has no subject', async () => {
    mockedFetch.mockResolvedValue({ok: true, json: async () => ({})} as unknown as Response)
    await expect(manager.authorize('code')).resolves.toMatchObject({
      accessToken: 'ya29',
      refreshToken: 'r',
      providerUserId: null
    })
  })

  it('refresh does not call the userinfo endpoint', async () => {
    await manager.refresh('r')
    expect(mockedFetch).not.toHaveBeenCalled()
  })
})
