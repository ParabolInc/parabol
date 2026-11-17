jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))
jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))

import {fetch} from '@whatwg-node/fetch'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import GitHubOAuth2Manager from '../GitHubOAuth2Manager'

const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

describe('GitHubOAuth2Manager', () => {
  const manager = new GitHubOAuth2Manager('cid', 'secret', 'https://api.github.com')

  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'gho_x',
      refreshToken: undefined,
      scopes: 'repo'
    })
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({login: 'octocat'})
    } as unknown as Response)
  })

  it('exchanges the code without a redirect_uri (GitHub uses the app callback)', async () => {
    await manager.authorize('code')
    expect(mockedAuthorize).toHaveBeenCalledWith({
      authUrl: 'https://github.com/login/oauth/access_token',
      body: {client_id: 'cid', client_secret: 'secret', code: 'code'}
    })
  })

  it('returns the tokens with the login as providerUserId', async () => {
    await expect(manager.authorize('code')).resolves.toEqual({
      accessToken: 'gho_x',
      refreshToken: undefined,
      scopes: 'repo',
      providerUserId: 'octocat'
    })
    expect(mockedFetch).toHaveBeenCalledWith('https://api.github.com/user', {
      headers: {
        Authorization: 'Bearer gho_x',
        'User-Agent': 'Parabol',
        Accept: 'application/vnd.github+json'
      }
    })
  })

  it('refresh is a no-op (tokens do not expire)', async () => {
    await expect(manager.refresh('r')).resolves.toBeInstanceOf(Error)
  })
})
