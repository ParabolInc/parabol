jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))
jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))

import {fetch} from '@whatwg-node/fetch'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import LinearManager from '../LinearManager'

const mockedAuthorize = authorizeOAuth2 as jest.MockedFunction<typeof authorizeOAuth2>
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

describe('LinearManager.authorize', () => {
  const manager = new LinearManager('cid', 'secret', 'https://linear.app')

  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'lin_at',
      refreshToken: 'r',
      scopes: 'read,write',
      expiresIn: 86400
    })
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({data: {viewer: {id: 'lin_user'}}})
    } as unknown as Response)
  })

  it('returns the viewer id as providerUserId', async () => {
    await expect(manager.authorize('code')).resolves.toMatchObject({
      accessToken: 'lin_at',
      refreshToken: 'r',
      scopes: 'read,write',
      providerUserId: 'lin_user'
    })
    expect(mockedFetch).toHaveBeenCalledWith('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {Authorization: 'Bearer lin_at', 'Content-Type': 'application/json'},
      body: JSON.stringify({query: '{ viewer { id } }'})
    })
  })

  it('fails the connection when the viewer lookup fails', async () => {
    mockedFetch.mockResolvedValue({ok: false, status: 401} as unknown as Response)
    await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
  })

  it('fails the connection when the viewer has no id', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({data: {viewer: {}}})
    } as unknown as Response)
    await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
  })

  it('refresh does not call the viewer endpoint', async () => {
    await expect(manager.refresh('r')).resolves.toMatchObject({expiresIn: 86400})
    expect(mockedFetch).not.toHaveBeenCalled()
  })
})
