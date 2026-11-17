jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))

import {fetch, Response} from '@whatwg-node/fetch'
import deactivateTeamMemberIntegrationAuthFamily from '../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily'
import {ThirdPartyResponseError} from '../../../utils/ThirdPartyResponseError'
import clickUpRequest, {ClickUpNotFoundError} from '../clickUpRequest'

const mockFetch = jest.mocked(fetch)
const mockDeactivate = jest.mocked(deactivateTeamMemberIntegrationAuthFamily)

const auth = {
  accessToken: 'tok',
  userId: 'user1',
  teamId: 'team1',
  providerId: 7,
  providerUserId: '42'
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})

const abortedLikeThePonyfill = (signal: AbortSignal) =>
  Object.assign(new Error('The operation was aborted', {cause: signal.reason}), {
    name: 'AbortError'
  })

beforeEach(() => {
  mockFetch.mockReset()
  mockDeactivate.mockReset()
})

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

test('clickUpRequest sends Bearer auth and bracketed array params', async () => {
  mockFetch.mockResolvedValue(jsonResponse({tasks: []}))
  const result = await clickUpRequest(auth, '/team/1/task', {
    query: {list_ids: ['2', '3'], page: 0, assignees: undefined}
  })
  expect(result).toEqual({tasks: []})
  const [url, init] = mockFetch.mock.calls[0]!
  expect(url).toBe(
    'https://api.clickup.com/api/v2/team/1/task?list_ids%5B%5D=2&list_ids%5B%5D=3&page=0'
  )
  expect(init?.method).toBe('GET')
  expect(init?.headers).toMatchObject({Authorization: 'Bearer tok'})
})

test('clickUpRequest sends a JSON body', async () => {
  mockFetch.mockResolvedValue(jsonResponse({id: 'c1'}))
  await clickUpRequest(auth, '/task/86abc/comment', {
    method: 'POST',
    body: {comment_text: 'Hi', notify_all: false}
  })
  const [, init] = mockFetch.mock.calls[0]!
  expect(init?.method).toBe('POST')
  expect(init?.headers).toMatchObject({'Content-Type': 'application/json'})
  expect(JSON.parse(String(init?.body))).toEqual({comment_text: 'Hi', notify_all: false})
})

test.each(['OAUTH_019', 'OAUTH_021', 'OAUTH_025', 'OAUTH_077'])(
  'clickUpRequest deactivates the auth family on a 401 with %s',
  async (ecode) => {
    mockFetch.mockResolvedValue(jsonResponse({err: 'Oauth token not found', ECODE: ecode}, 401))
    const result = await clickUpRequest(auth, '/team')
    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('Reconnect ClickUp: access was revoked')
    expect(mockDeactivate).toHaveBeenCalledTimes(1)
    expect(mockDeactivate).toHaveBeenCalledWith({
      userId: 'user1',
      teamId: 'team1',
      providerId: 7,
      providerUserId: '42'
    })
  }
)

test.each([400, 403, 500])(
  'clickUpRequest keeps the auth when a revoked-grant code comes with a %p',
  async (status) => {
    mockFetch.mockResolvedValue(
      jsonResponse({err: 'Oauth token not found', ECODE: 'OAUTH_019'}, status)
    )
    const result = await clickUpRequest(auth, '/team')
    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('ClickUp: Oauth token not found')
    expect(mockDeactivate).not.toHaveBeenCalled()
  }
)

test('clickUpRequest with only a token reports a revoked grant without deactivating anything', async () => {
  mockFetch.mockResolvedValue(jsonResponse({err: 'Oauth token not found', ECODE: 'OAUTH_019'}, 401))
  const result = await clickUpRequest({accessToken: 'tok'}, '/user')
  expect((result as Error).message).toBe('Reconnect ClickUp: access was revoked')
  expect(mockDeactivate).not.toHaveBeenCalled()
})

test('clickUpRequest does not deactivate on OAUTH_027', async () => {
  mockFetch.mockResolvedValue(jsonResponse({err: 'Team not authorized', ECODE: 'OAUTH_027'}, 401))
  const result = await clickUpRequest(auth, '/team/9012345/space', {query: {archived: false}})
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe(
    'ClickUp workspace 9012345 is not shared with Parabol. Reconnect ClickUp and select it'
  )
  expect(mockDeactivate).not.toHaveBeenCalled()
})

test.each([
  [
    '/task/ENG-12',
    {query: {custom_task_ids: true, team_id: '9012345'}},
    'ClickUp workspace 9012345 is not shared with Parabol. Reconnect ClickUp and select it'
  ],
  [
    '/space/790/folder',
    {query: {archived: false}, workspaceId: '9012345'},
    'ClickUp workspace 9012345 is not shared with Parabol. Reconnect ClickUp and select it'
  ],
  [
    '/task/86abc',
    {},
    'This ClickUp workspace is not shared with Parabol. Reconnect ClickUp and select it'
  ]
])('clickUpRequest names the unshared workspace of %s when it can', async (path, init, message) => {
  mockFetch.mockResolvedValue(jsonResponse({err: 'Team not authorized', ECODE: 'OAUTH_041'}, 401))
  const result = await clickUpRequest(auth, path, init)
  expect((result as Error).message).toBe(message)
  expect(mockDeactivate).not.toHaveBeenCalled()
})

test('clickUpRequest maps 429 to the rate-limit message and does not retry', async () => {
  mockFetch.mockResolvedValue(new Response('Too Many Requests', {status: 429}))
  const result = await clickUpRequest(auth, '/team/1/task')
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe('ClickUp rate limit reached, try again in a minute')
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

test('clickUpRequest reports a page that is not JSON with what ClickUp sent', async () => {
  mockFetch.mockResolvedValue(
    new Response('<html>502 Bad Gateway</html>', {
      status: 502,
      headers: {'content-type': 'text/html'}
    })
  )
  const result = await clickUpRequest(auth, '/team')
  expect(result).toBeInstanceOf(ThirdPartyResponseError)
  expect((result as ThirdPartyResponseError).response).toMatchObject({
    integration: 'clickup',
    method: 'GET',
    path: '/api/v2/team',
    status: 502,
    body: '<html>502 Bad Gateway</html>'
  })
})

test('clickUpRequest gives up after 15 seconds', async () => {
  jest.useFakeTimers()
  jest.spyOn(AbortSignal, 'timeout').mockImplementation((ms) => {
    const controller = new AbortController()
    setTimeout(() => {
      controller.abort(new DOMException('The operation was aborted due to timeout', 'TimeoutError'))
    }, ms)
    return controller.signal
  })
  mockFetch.mockImplementation(
    (_url, init) =>
      new Promise<never>((_resolve, reject) => {
        const signal = init?.signal
        signal?.addEventListener('abort', () => reject(abortedLikeThePonyfill(signal)))
      })
  )
  const pending = clickUpRequest(auth, '/team')
  await jest.advanceTimersByTimeAsync(14_999)
  const signal = mockFetch.mock.calls[0]![1]?.signal
  expect(signal?.aborted).toBe(false)
  await jest.advanceTimersByTimeAsync(1)
  const result = await pending
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe('ClickUp did not respond in time')
})

test('clickUpRequest marks a 404 as not found', async () => {
  mockFetch.mockResolvedValue(jsonResponse({err: 'Task not found', ECODE: 'ITEM_013'}, 404))
  const result = await clickUpRequest(auth, '/task/86abc')
  expect(result).toBeInstanceOf(ClickUpNotFoundError)
  expect((result as Error).message).toBe('ClickUp: Task not found')
  expect(mockDeactivate).not.toHaveBeenCalled()
})

test('clickUpRequest returns any other ClickUp error with its message', async () => {
  mockFetch.mockResolvedValue(
    jsonResponse({err: 'not a valid points selection', ECODE: 'ITEM_223'}, 400)
  )
  const result = await clickUpRequest(auth, '/task/86abc', {method: 'PUT', body: {points: 4}})
  expect(result).toBeInstanceOf(Error)
  expect(result).not.toBeInstanceOf(ClickUpNotFoundError)
  expect((result as Error).message).toBe('ClickUp: not a valid points selection')
  expect(mockDeactivate).not.toHaveBeenCalled()
})
