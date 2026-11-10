jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))

import {fetch, Response} from '@whatwg-node/fetch'
import {clickUpSpace, clickUpTask} from '../../../dataloader/clickUpLoaders'
import type RootDataLoader from '../../../dataloader/RootDataLoader'
import getRedis from '../../../utils/getRedis'
import logError from '../../../utils/logError'
import type {ClickUpApiTask} from '../ClickUpApiTypes'
import makeMemoryRedis from './memoryRedis'

const mockFetch = jest.mocked(fetch)
const mockGetRedis = jest.mocked(getRedis)
const mockLogError = jest.mocked(logError)

const apiTask: ClickUpApiTask = {
  id: '86abc',
  custom_id: null,
  custom_item_id: 0,
  name: 'Fix login',
  markdown_description: '',
  status: {status: 'to do', color: '#d3d3d3', type: 'open'},
  date_updated: '1762500000000',
  url: 'https://app.clickup.com/t/86abc',
  team_id: '1',
  list: {id: '1000', name: 'Sprint 1'},
  folder: {id: '100', name: 'Q4'},
  space: {id: '10'}
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})

const makeParent = () =>
  ({
    dataLoaderOptions: {},
    get: (name: string) => {
      if (name !== 'freshAuth') throw new Error(`Unexpected loader ${name}`)
      return {
        load: async ({teamId, userId}: {teamId: string; userId: string}) => ({
          accessToken: `tok-${userId}`,
          userId,
          teamId,
          providerId: 7,
          providerUserId: '42'
        })
      }
    }
  }) as unknown as RootDataLoader

const taskKey = (userId = 'facilitator') => ({teamId: 'team1', userId, taskId: '86abc'})

beforeEach(() => {
  mockFetch.mockReset().mockImplementation(async () => jsonResponse(apiTask))
  mockGetRedis.mockReturnValue(makeMemoryRedis().redis)
})

test('participants loading the same task in separate requests share one ClickUp read', async () => {
  const participants = Array.from({length: 5}, () => clickUpTask(makeParent()))
  const tasks = await Promise.all(participants.map((loader) => loader.load(taskKey())))
  const later = await clickUpTask(makeParent()).load(taskKey())
  expect(mockFetch).toHaveBeenCalledTimes(1)
  expect(tasks.every((task) => task?.title === 'Fix login')).toBe(true)
  expect(later?.title).toBe('Fix login')
})

test('a task read through another user is fetched with that user', async () => {
  await clickUpTask(makeParent()).load(taskKey('facilitator'))
  await clickUpTask(makeParent()).load(taskKey('teammate'))
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

test('the Space is read once across requests', async () => {
  mockFetch.mockImplementation(async () =>
    jsonResponse({id: '10', name: 'Eng', features: {points: {enabled: true}}})
  )
  const spaceKey = {teamId: 'team1', userId: 'facilitator', spaceId: '10'}
  await clickUpSpace(makeParent()).load(spaceKey)
  const space = await clickUpSpace(makeParent()).load(spaceKey)
  expect(space).toEqual({id: '10', name: 'Eng', features: {points: {enabled: true}}})
  expect(mockFetch).toHaveBeenCalledTimes(1)
})

test.each([
  ['a deleted task', jsonResponse({err: 'Task not found', ECODE: 'ITEM_013'}, 404)],
  ['a rate limit', new Response('', {status: 429})],
  ['an unshared workspace', jsonResponse({err: 'Team not authorized', ECODE: 'OAUTH_027'}, 401)]
])('the task loader returns null without logging %s', async (_label, response) => {
  mockFetch.mockResolvedValue(response)
  await expect(clickUpTask(makeParent()).load(taskKey())).resolves.toBeNull()
  expect(mockLogError).not.toHaveBeenCalled()
})

test.each([
  ['a ClickUp server error', jsonResponse({err: 'Internal error', ECODE: 'SRV_001'}, 500)],
  ['a page that is not JSON', new Response('<html>502</html>', {status: 502})]
])('the task loader logs %s', async (_label, response) => {
  mockFetch.mockResolvedValue(response)
  await expect(clickUpTask(makeParent()).load(taskKey())).resolves.toBeNull()
  expect(mockLogError).toHaveBeenCalledTimes(1)
})
