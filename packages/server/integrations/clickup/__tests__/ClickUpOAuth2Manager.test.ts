jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))

import {fetch, Response} from '@whatwg-node/fetch'
import ClickUpOAuth2Manager from '../ClickUpOAuth2Manager'

const mockFetch = jest.mocked(fetch)

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})

const manager = new ClickUpOAuth2Manager('cid', 'secret', 'https://api.clickup.com/api/v2')

beforeEach(() => {
  mockFetch.mockReset()
})

test('ClickUpOAuth2Manager.authorize posts JSON {client_id, client_secret, code} to the token URL then reads /user', async () => {
  mockFetch
    .mockResolvedValueOnce(jsonResponse({access_token: 't'}))
    .mockResolvedValueOnce(jsonResponse({user: {id: 42, username: 'ada'}}))
  await expect(manager.authorize('code')).resolves.toEqual({
    accessToken: 't',
    refreshToken: undefined,
    scopes: '',
    providerUserId: '42'
  })
  const [tokenUrl, tokenInit] = mockFetch.mock.calls[0]!
  expect(String(tokenUrl)).toBe('https://api.clickup.com/api/v2/oauth/token')
  expect(tokenInit).toMatchObject({method: 'POST', headers: {'Content-Type': 'application/json'}})
  expect(JSON.parse(String(tokenInit?.body))).toEqual({
    client_id: 'cid',
    client_secret: 'secret',
    code: 'code'
  })
  const [userUrl, userInit] = mockFetch.mock.calls[1]!
  expect(userUrl).toBe('https://api.clickup.com/api/v2/user')
  expect(userInit?.headers).toMatchObject({Authorization: 'Bearer t'})
})

test('ClickUpOAuth2Manager.authorize returns the token error without reading /user', async () => {
  mockFetch.mockResolvedValueOnce(
    jsonResponse(
      {
        err: 'Invalid client credentials',
        ECODE: 'OAUTH_011',
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      },
      401
    )
  )
  const result = await manager.authorize('code')
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe('Invalid client credentials')
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

test('ClickUpOAuth2Manager.authorize returns an Error when /user fails', async () => {
  mockFetch
    .mockResolvedValueOnce(jsonResponse({access_token: 't'}))
    .mockResolvedValueOnce(jsonResponse({err: 'Oauth token not found', ECODE: 'OAUTH_019'}, 401))
  await expect(manager.authorize('code')).resolves.toBeInstanceOf(Error)
})

test('refresh returns an Error', async () => {
  await expect(manager.refresh('r')).resolves.toEqual(new Error('ClickUp tokens do not expire'))
  expect(mockFetch).not.toHaveBeenCalled()
})
