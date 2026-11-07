jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))

import {fetch, Response} from '@whatwg-node/fetch'
import getRedis from '../../../utils/getRedis'
import type {ClickUpApiTask} from '../ClickUpApiTypes'
import {ClickUpNotFoundError} from '../clickUpRequest'
import fetchClickUpTask from '../fetchClickUpTask'
import listClickUpWorkspaces from '../listClickUpWorkspaces'
import makeMemoryRedis from './memoryRedis'

const mockFetch = jest.mocked(fetch)
const mockGetRedis = jest.mocked(getRedis)

const authFor = (userId: string) => ({
  accessToken: `tok-${userId}`,
  userId,
  teamId: 'team1',
  providerId: 7,
  providerUserId: '42'
})

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

let memory: ReturnType<typeof makeMemoryRedis>
const startedAt = Date.now()
const now = jest.spyOn(Date, 'now')
const later = (ms: number) => now.mockReturnValue(startedAt + ms)

beforeEach(() => {
  mockFetch.mockReset().mockImplementation(async () => jsonResponse(apiTask))
  memory = makeMemoryRedis()
  mockGetRedis.mockReturnValue(memory.redis)
  later(0)
})

afterAll(() => {
  now.mockRestore()
})

test('a second read of a task within 30 seconds makes no second fetch', async () => {
  const first = await fetchClickUpTask(authFor('user1'), '86abc')
  later(29_000)
  const second = await fetchClickUpTask(authFor('user1'), '86abc')
  expect(mockFetch).toHaveBeenCalledTimes(1)
  expect(second).toEqual(first)
  expect(second).toMatchObject({id: '1::86abc', title: 'Fix login', updatedAt: expect.any(Date)})
})

test('a task read after 30 seconds fetches again', async () => {
  await fetchClickUpTask(authFor('user1'), '86abc')
  later(31_000)
  await fetchClickUpTask(authFor('user1'), '86abc')
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

test('each user reads the task with their own cache key and token', async () => {
  await fetchClickUpTask(authFor('user1'), '86abc')
  await fetchClickUpTask(authFor('user2'), '86abc')
  expect(mockFetch).toHaveBeenCalledTimes(2)
  expect(mockFetch.mock.calls.map(([, init]) => init?.headers)).toEqual([
    expect.objectContaining({Authorization: 'Bearer tok-user1'}),
    expect.objectContaining({Authorization: 'Bearer tok-user2'})
  ])
  const keys = memory.keys()
  expect(keys).toHaveLength(2)
  expect(keys[0]).toContain(':user1:')
  expect(keys[1]).toContain(':user2:')
})

test('a custom id is cached apart for each workspace it is looked up in', async () => {
  await fetchClickUpTask(authFor('user1'), 'ENG-12', '1')
  await fetchClickUpTask(authFor('user1'), 'ENG-12', '2')
  await fetchClickUpTask(authFor('user1'), 'ENG-12', '1')
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

test('a failed read is not cached', async () => {
  mockFetch.mockResolvedValueOnce(jsonResponse({err: 'Task not found', ECODE: 'ITEM_013'}, 404))
  await expect(fetchClickUpTask(authFor('user1'), '86abc')).resolves.toBeInstanceOf(
    ClickUpNotFoundError
  )
  await expect(fetchClickUpTask(authFor('user1'), '86abc')).resolves.toMatchObject({
    title: 'Fix login'
  })
  expect(mockFetch).toHaveBeenCalledTimes(2)
})

test('the workspace list is read once per 5 minutes', async () => {
  mockFetch.mockImplementation(async () => jsonResponse({teams: [{id: '1', name: 'Acme'}]}))
  await listClickUpWorkspaces(authFor('user1'))
  later(4 * 60_000)
  await expect(listClickUpWorkspaces(authFor('user1'))).resolves.toEqual([{id: '1', name: 'Acme'}])
  expect(mockFetch).toHaveBeenCalledTimes(1)
  later(6 * 60_000)
  await listClickUpWorkspaces(authFor('user1'))
  expect(mockFetch).toHaveBeenCalledTimes(2)
})
