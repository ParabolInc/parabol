import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../graphql/graphql'
import logError from '../../utils/logError'
import publish from '../../utils/publish'
import {redisStoreAndNetwork} from '../../utils/redisStoreAndNetwork'
import loadServiceRepoIntegrations from '../loadServiceRepoIntegrations'
import {getServerIntegration} from '../platform/registry'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'

jest.mock('../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../utils/publish', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../utils/redisStoreAndNetwork', () => ({redisStoreAndNetwork: jest.fn()}))
jest.mock('../platform/registry', () => ({getServerIntegration: jest.fn()}))

const mockStoreAndNetwork = redisStoreAndNetwork as jest.MockedFunction<typeof redisStoreAndNetwork>
const mockGetServerIntegration = getServerIntegration as jest.MockedFunction<
  typeof getServerIntegration
>

const resolveAuth = jest.fn()
const isConnected = jest.fn()
const fetchRepos = jest.fn()
const githubRepo = {id: 'o/a', service: 'github' as const, nameWithOwner: 'o/a'}
const expectedOptions = {
  maxAge: 30 * 1000,
  ttl: 2 * 24 * 60 * 60 * 1000,
  onUpdate: expect.any(Function)
}

const ctx = {
  dataLoader: {get: jest.fn()},
  teamId: 't1',
  userId: 'u1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo
} as unknown as GqlIntegrationCtx

beforeEach(() => {
  jest.clearAllMocks()
  mockGetServerIntegration.mockReturnValue({
    title: 'GitHub',
    getCapabilityKeys: () => ['repoList'],
    isConnected,
    resolveAuth,
    capabilities: {repoList: {fetchRepos}}
  } as unknown as ReturnType<typeof getServerIntegration>)
  isConnected.mockResolvedValue(true)
  resolveAuth.mockResolvedValue({accessToken: 'tok'})
  mockStoreAndNetwork.mockImplementation(async (_key, thunk, transform) => {
    const raw = await thunk()
    return raw instanceof Error ? raw : transform(raw)
  })
})

test('a cached list is served through the store without fetching', async () => {
  mockStoreAndNetwork.mockResolvedValue([githubRepo])
  await expect(loadServiceRepoIntegrations('github', ctx)).resolves.toEqual([githubRepo])
  expect(mockStoreAndNetwork).toHaveBeenCalledWith(
    'repoIntegrations:v2:github:t1:u1',
    expect.any(Function),
    expect.any(Function),
    expectedOptions
  )
  expect(resolveAuth).not.toHaveBeenCalled()
  expect(fetchRepos).not.toHaveBeenCalled()
})

test('a miss fetches inside the store thunk', async () => {
  fetchRepos.mockResolvedValue([githubRepo])
  await expect(loadServiceRepoIntegrations('github', ctx)).resolves.toEqual([githubRepo])
  expect(fetchRepos).toHaveBeenCalledWith(ctx)
})

test('an unconnected service is [] and never touches the store', async () => {
  isConnected.mockResolvedValue(false)
  await expect(loadServiceRepoIntegrations('github', ctx)).resolves.toEqual([])
  expect(mockStoreAndNetwork).not.toHaveBeenCalled()
  expect(resolveAuth).not.toHaveBeenCalled()
})

test('a service without a repo list is [] and never touches the store', async () => {
  mockGetServerIntegration.mockReturnValue({
    isConnected,
    resolveAuth,
    capabilities: {}
  } as unknown as ReturnType<typeof getServerIntegration>)
  await expect(loadServiceRepoIntegrations('github', ctx)).resolves.toEqual([])
  expect(mockStoreAndNetwork).not.toHaveBeenCalled()
})

test('a connected row whose token cannot be refreshed is a failed fetch that is never cached', async () => {
  resolveAuth.mockResolvedValue(null)
  await expect(loadServiceRepoIntegrations('github', ctx)).resolves.toBeNull()
  expect(fetchRepos).not.toHaveBeenCalled()
  expect(logError).not.toHaveBeenCalled()
})

test('a remote failure is null and logged with the service tag', async () => {
  const failure = new Error('rate limited')
  fetchRepos.mockResolvedValue(failure)
  await expect(loadServiceRepoIntegrations('github', ctx)).resolves.toBeNull()
  expect(logError).toHaveBeenCalledWith(failure, {
    userId: 'u1',
    tags: {teamId: 't1', service: 'github'}
  })
})

test('a rejected fetch is treated like a returned error', async () => {
  fetchRepos.mockRejectedValue(new Error('boom'))
  await expect(loadServiceRepoIntegrations('github', ctx)).resolves.toBeNull()
  expect(logError).toHaveBeenCalledWith(expect.objectContaining({message: 'boom'}), {
    userId: 'u1',
    tags: {teamId: 't1', service: 'github'}
  })
})

test('a background refresh that changes the list pushes the service to the user', async () => {
  mockStoreAndNetwork.mockResolvedValue([githubRepo])
  await loadServiceRepoIntegrations('github', ctx)
  const [, , , options] = mockStoreAndNetwork.mock.calls[0]!
  expect(publish).not.toHaveBeenCalled()
  await options?.onUpdate?.([githubRepo])
  expect(publish).toHaveBeenCalledWith(
    'notification',
    'u1',
    'IntegrationService',
    expect.objectContaining({service: 'github', teamId: 't1', userId: 'u1'})
  )
})
