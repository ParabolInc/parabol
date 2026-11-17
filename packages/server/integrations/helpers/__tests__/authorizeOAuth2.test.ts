import {fetch, Response} from '@whatwg-node/fetch'
import {isDeadGrant, OAuth2TokenError} from '../../../utils/OAuth2TokenError'
import {ThirdPartyResponseError} from '../../../utils/ThirdPartyResponseError'
import {authorizeOAuth2} from '../authorizeOAuth2'

jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
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
  expect(result).toBeInstanceOf(ThirdPartyResponseError)
  expect((result as ThirdPartyResponseError).message).toBe(
    'https://api.clickup.com/api/v2/oauth/token returned no access_token'
  )
  expect((result as ThirdPartyResponseError).response).toMatchObject({status: 200, body: '{}'})
})

test('a token endpoint that answers JSON without a token or an OAuth2 error is reported with what it sent', async () => {
  mockFetch.mockResolvedValue(
    new Response('{"err":"Rate limit reached","ECODE":"APP_002"}', {
      status: 429,
      headers: {'content-type': 'application/json; charset=utf-8'}
    })
  )
  const result = await authorizeOAuth2({
    authUrl: 'https://api.clickup.com/api/v2/oauth/token',
    body: {client_id: 'id', client_secret: 's3cr3t', code: 'abc'}
  })
  expect(result).toBeInstanceOf(ThirdPartyResponseError)
  expect((result as ThirdPartyResponseError).message).toBe(
    'https://api.clickup.com/api/v2/oauth/token returned no access_token'
  )
  expect((result as ThirdPartyResponseError).response).toEqual({
    integration: 'oauth2',
    method: 'POST',
    endpoint: 'api.clickup.com/api/v2/oauth/token',
    path: '/api/v2/oauth/token',
    status: 429,
    contentType: 'application/json; charset=utf-8',
    body: '{"err":"Rate limit reached","ECODE":"APP_002"}'
  })
})

const answerOAuth2Error = (status: number, body: object) =>
  mockFetch.mockResolvedValue(
    new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})
  )

test('a token endpoint that names an OAuth2 error keeps its code and is described like a plain Error', async () => {
  answerOAuth2Error(400, {error: 'invalid_grant', error_description: 'Token was revoked'})
  const result = await authorizeOAuth2({authUrl: 'https://gitlab.example.com/oauth/token'})
  expect(result).toBeInstanceOf(OAuth2TokenError)
  expect(result).not.toBeInstanceOf(ThirdPartyResponseError)
  expect(result).toMatchObject({name: 'Error', message: 'Token was revoked', code: 'invalid_grant'})
})

test.each([
  {provider: 'Google', status: 400, error: 'invalid_grant', description: 'Bad Request'},
  {provider: 'Linear', status: 400, error: 'invalid_grant', description: 'Refresh token expired'},
  {
    provider: 'Atlassian',
    status: 403,
    error: 'unauthorized_client',
    description: 'Token was globally revoked'
  },
  {
    provider: 'Atlassian',
    status: 403,
    error: 'unauthorized_client',
    description: 'refresh_token is invalid'
  }
])(
  '$provider refusing a refresh token with "$description" is a dead grant',
  async ({status, error, description}) => {
    answerOAuth2Error(status, {error, error_description: description})
    const result = await authorizeOAuth2({authUrl: 'https://auth.example.com/oauth/token'})
    expect(isDeadGrant(result)).toBe(true)
  }
)

test.each([
  ['invalid_client', 'Unauthorized'],
  ['invalid_request', 'AADSTS9002313: Invalid request. Request is malformed or invalid.']
])(
  'a token endpoint refusing our client or request with %s is not a dead grant',
  async (error, description) => {
    answerOAuth2Error(400, {error, error_description: description})
    const result = await authorizeOAuth2({authUrl: 'https://auth.example.com/oauth/token'})
    expect(result).toBeInstanceOf(OAuth2TokenError)
    expect(isDeadGrant(result)).toBe(false)
  }
)

test('a token response is read into tokens', async () => {
  mockFetch.mockResolvedValue(
    new Response('{"access_token":"tok","refresh_token":"ref","scope":"api","expires_in":7200}', {
      status: 200,
      headers: {'content-type': 'application/json'}
    })
  )
  await expect(
    authorizeOAuth2({authUrl: 'https://gitlab.example.com/oauth/token'})
  ).resolves.toEqual({accessToken: 'tok', refreshToken: 'ref', scopes: 'api', expiresIn: 7200})
})
