jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))
jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))

import {fetch} from '@whatwg-node/fetch'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import GitLabOAuth2Manager from '../GitLabOAuth2Manager'

const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

describe('GitLabOAuth2Manager.authorize', () => {
  const manager = new GitLabOAuth2Manager('cid', 'secret', 'https://gitlab.example.com')

  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'glpat',
      refreshToken: 'r',
      scopes: 'api',
      expiresIn: 7200
    })
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({id: 42, username: 'dev'})
    } as unknown as Response)
  })

  it('returns the numeric user id as providerUserId', async () => {
    await expect(manager.authorize('code')).resolves.toMatchObject({
      accessToken: 'glpat',
      refreshToken: 'r',
      scopes: 'api',
      providerUserId: '42'
    })
    expect(mockedFetch).toHaveBeenCalledWith('https://gitlab.example.com/api/v4/user', {
      headers: {Authorization: 'Bearer glpat'}
    })
  })

  it('fails the connection when the user lookup fails', async () => {
    mockedFetch.mockResolvedValue({ok: false, status: 401} as unknown as Response)
    await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
  })

  it('fails the connection when the user has no id', async () => {
    mockedFetch.mockResolvedValue({ok: true, json: async () => ({})} as unknown as Response)
    await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
  })

  it('passes the token exchange error through without calling the user endpoint', async () => {
    mockedAuthorize.mockResolvedValue(new Error('bad code'))
    await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it('refresh does not call the user endpoint', async () => {
    await manager.refresh('r')
    expect(mockedFetch).not.toHaveBeenCalled()
  })
})
