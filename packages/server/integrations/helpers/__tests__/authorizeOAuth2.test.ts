import {fetch} from '@whatwg-node/fetch'
import {ThirdPartyResponseError} from '../../../utils/ThirdPartyResponseError'
import {authorizeOAuth2} from '../authorizeOAuth2'

jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))
const mockFetch = jest.mocked(fetch)

test("a token endpoint that answers with a page is reported with what it sent, and the request's secrets stay out", async () => {
  mockFetch.mockResolvedValue(
    new Response('<html><title>502 Bad Gateway</title></html>', {
      status: 502,
      headers: {'content-type': 'text/html'}
    })
  )
  const result = await authorizeOAuth2({
    authUrl: 'https://gitlab.example.com/oauth/token',
    searchParams: {client_secret: 's3cr3t', code: 'abc'}
  })
  expect(result).toBeInstanceOf(ThirdPartyResponseError)
  expect((result as ThirdPartyResponseError).message).toBe('Received non-JSON OAuth2 Response')
  expect((result as ThirdPartyResponseError).response).toEqual({
    integration: 'oauth2',
    method: 'POST',
    endpoint: 'gitlab.example.com/oauth/token',
    path: '/oauth/token',
    status: 502,
    contentType: 'text/html',
    body: '<html><title>502 Bad Gateway</title></html>'
  })
})

test('authorizeOAuth2 returns an Error when the token response has no access_token', async () => {
  mockFetch.mockResolvedValue(
    new Response('{}', {status: 200, headers: {'content-type': 'application/json'}})
  )
  const result = await authorizeOAuth2({
    authUrl: 'https://api.clickup.com/api/v2/oauth/token',
    body: {client_id: 'id', client_secret: 's3cr3t', code: 'abc'}
  })
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe(
    'https://api.clickup.com/api/v2/oauth/token returned no access_token'
  )
})
