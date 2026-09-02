import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../graphql/graphql'
import getRedis from '../../utils/getRedis'
import logError from '../../utils/logError'
import loadServiceRepoIntegrations from '../loadServiceRepoIntegrations'
import {getServerIntegration} from '../platform/registry'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'

jest.mock('../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../platform/registry', () => ({getServerIntegration: jest.fn()}))

const mockGetRedis = getRedis as jest.MockedFunction<typeof getRedis>
const mockGetServerIntegration = getServerIntegration as jest.MockedFunction<
  typeof getServerIntegration
>

const set = jest.fn().mockResolvedValue('OK')
const cacheLoad = jest.fn()
const resolveAuth = jest.fn()
const isConnected = jest.fn()
const fetchRepos = jest.fn()
const githubRepo = {id: 'o/a', service: 'github' as const, nameWithOwner: 'o/a'}

const ctx = {
  dataLoader: {get: () => ({load: cacheLoad})},
  teamId: 't1',
  userId: 'u1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo
} as unknown as GqlIntegrationCtx

beforeEach(() => {
  jest.clearAllMocks()
  mockGetRedis.mockReturnValue({set} as unknown as ReturnType<typeof getRedis>)
  mockGetServerIntegration.mockReturnValue({
    isConnected,
    resolveAuth,
    capabilities: {repoList: {fetchRepos}}
  } as unknown as ReturnType<typeof getServerIntegration>)
  isConnected.mockResolvedValue(true)
  resolveAuth.mockResolvedValue({accessToken: 'tok'})
})

test('returns the cached list without touching the remote', async () => {
  cacheLoad.mockResolvedValue([githubRepo])
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toEqual([githubRepo])
  expect(fetchRepos).not.toHaveBeenCalled()
  expect(set).not.toHaveBeenCalled()
})

test('a cached empty list is a hit', async () => {
  cacheLoad.mockResolvedValue([])
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toEqual([])
  expect(fetchRepos).not.toHaveBeenCalled()
})

test('fetches on a miss and caches the success for 90 days', async () => {
  cacheLoad.mockResolvedValue(null)
  fetchRepos.mockResolvedValue([githubRepo])
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toEqual([githubRepo])
  expect(fetchRepos).toHaveBeenCalledWith(ctx)
  expect(set).toHaveBeenCalledWith(
    'repoIntegrations:github:t1:u1',
    JSON.stringify([githubRepo]),
    'PX',
    90 * 24 * 60 * 60 * 1000
  )
})

test('an unconnected service is [] and is never fetched or cached', async () => {
  cacheLoad.mockResolvedValue(null)
  isConnected.mockResolvedValue(false)
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toEqual([])
  expect(resolveAuth).not.toHaveBeenCalled()
  expect(fetchRepos).not.toHaveBeenCalled()
  expect(set).not.toHaveBeenCalled()
})

test('a connected row whose token cannot be refreshed is [] and is never fetched or cached', async () => {
  cacheLoad.mockResolvedValue(null)
  resolveAuth.mockResolvedValue(null)
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toEqual([])
  expect(fetchRepos).not.toHaveBeenCalled()
  expect(set).not.toHaveBeenCalled()
})

test('an empty remote list is cached only briefly', async () => {
  cacheLoad.mockResolvedValue(null)
  fetchRepos.mockResolvedValue([])
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toEqual([])
  expect(set).toHaveBeenCalledWith('repoIntegrations:github:t1:u1', '[]', 'PX', 60 * 60 * 1000)
})

test('a remote failure is null, logged with the service tag, and never cached', async () => {
  cacheLoad.mockResolvedValue(null)
  const failure = new Error('rate limited')
  fetchRepos.mockResolvedValue(failure)
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toBeNull()
  expect(logError).toHaveBeenCalledWith(failure, {
    userId: 'u1',
    tags: {teamId: 't1', service: 'github'}
  })
  expect(set).not.toHaveBeenCalled()
})

test('a rejected fetch is treated like a returned error', async () => {
  cacheLoad.mockResolvedValue(null)
  fetchRepos.mockRejectedValue(new Error('boom'))
  await expect(loadServiceRepoIntegrations('github', ctx, false)).resolves.toBeNull()
  expect(logError).toHaveBeenCalledWith(expect.objectContaining({message: 'boom'}), {
    userId: 'u1',
    tags: {teamId: 't1', service: 'github'}
  })
  expect(set).not.toHaveBeenCalled()
})

test('networkOnly skips the cache read but still writes the result', async () => {
  cacheLoad.mockResolvedValue([{id: 'stale', service: 'github', nameWithOwner: 'stale'}])
  fetchRepos.mockResolvedValue([githubRepo])
  await expect(loadServiceRepoIntegrations('github', ctx, true)).resolves.toEqual([githubRepo])
  expect(cacheLoad).not.toHaveBeenCalled()
  expect(set).toHaveBeenCalledTimes(1)
})
