jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))
jest.mock('../../../utils/fetchUntrusted', () => ({requestUntrusted: jest.fn()}))

import {requestUntrusted} from '../../../utils/fetchUntrusted'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import GitHubOAuth2Manager from '../GitHubOAuth2Manager'

const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>
const mockedRequest = requestUntrusted as jest.MockedFunction<typeof requestUntrusted>

describe('GitHubOAuth2Manager', () => {
  const manager = new GitHubOAuth2Manager('cid', 'secret', 'https://api.github.com')

  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'gho_x',
      refreshToken: undefined,
      scopes: 'repo'
    })
    mockedRequest.mockResolvedValue({
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
    expect(mockedRequest).toHaveBeenCalledWith('https://api.github.com/user', {
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
