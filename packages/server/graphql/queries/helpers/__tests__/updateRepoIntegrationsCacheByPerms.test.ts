import getConnectedTaskServices from '../../../../integrations/platform/getConnectedTaskServices'
import type {
  GitHubRepo,
  GitLabProject
} from '../../../../integrations/platform/RemoteRepoIntegration'
import getRedis from '../../../../utils/getRedis'
import logError from '../../../../utils/logError'
import type {DataLoaderWorker} from '../../../graphql'
import getAllCachedRepoIntegrations from '../getAllCachedRepoIntegrations'
import getPrevUsedRepoIntegrations from '../getPrevUsedRepoIntegrations'
import updateRepoIntegrationsCacheByPerms from '../updateRepoIntegrationsCacheByPerms'

jest.mock('../../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../getAllCachedRepoIntegrations', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../getPrevUsedRepoIntegrations', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../../integrations/platform/getConnectedTaskServices', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockGetRedis = getRedis as jest.MockedFunction<typeof getRedis>
const mockGetAllCachedRepoIntegrations = getAllCachedRepoIntegrations as jest.MockedFunction<
  typeof getAllCachedRepoIntegrations
>
const mockGetPrevUsedRepoIntegrations = getPrevUsedRepoIntegrations as jest.MockedFunction<
  typeof getPrevUsedRepoIntegrations
>
const mockGetConnectedTaskServices = getConnectedTaskServices as jest.MockedFunction<
  typeof getConnectedTaskServices
>
const mockLogError = logError as jest.MockedFunction<typeof logError>

const dataLoader = {} as DataLoaderWorker
const viewerId = 'u1'
const teamId = 't1'

const del = jest.fn().mockResolvedValue(1)
const set = jest.fn().mockResolvedValue('OK')
const zrem = jest.fn().mockResolvedValue(0)

beforeEach(() => {
  jest.clearAllMocks()
  del.mockResolvedValue(1)
  set.mockResolvedValue('OK')
  zrem.mockResolvedValue(0)
  mockGetRedis.mockReturnValue({del, set, zrem} as unknown as ReturnType<typeof getRedis>)
})

test('removes only the stale prev-used members in a single zrem call and caches only the repos with perms', async () => {
  const githubRepo: GitHubRepo = {
    id: 'g1',
    service: 'github',
    nameWithOwner: 'o/g1'
  }
  const gitlabRepo: GitLabProject = {
    id: 'l1',
    service: 'gitlab',
    __typename: 'Project',
    fullPath: 'o/l1'
  }
  const gitlabA: GitLabProject = {
    id: 'lA',
    service: 'gitlab',
    __typename: 'Project',
    fullPath: 'o/lA'
  }
  const gitlabB: GitLabProject = {
    id: 'lB',
    service: 'gitlab',
    __typename: 'Project',
    fullPath: 'o/lB'
  }
  const githubA: GitHubRepo = {
    id: 'gA',
    service: 'github',
    nameWithOwner: 'o/gA'
  }
  mockGetAllCachedRepoIntegrations.mockResolvedValue([githubRepo, gitlabRepo])
  mockGetPrevUsedRepoIntegrations.mockResolvedValue([gitlabA, gitlabB, githubA])
  mockGetConnectedTaskServices.mockResolvedValue(['github'])

  await updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)

  expect(zrem).toHaveBeenCalledTimes(1)
  expect(zrem).toHaveBeenCalledWith('prevUsedRepoIntegrations:t1', [
    JSON.stringify(gitlabA),
    JSON.stringify(gitlabB)
  ])
  expect(set).toHaveBeenCalledWith(
    'allRepoIntegrations:t1:u1',
    JSON.stringify([githubRepo]),
    'PX',
    expect.any(Number)
  )
  expect(del).not.toHaveBeenCalled()
})

test('does not call zrem when nothing is stale', async () => {
  mockGetAllCachedRepoIntegrations.mockResolvedValue(null)
  mockGetPrevUsedRepoIntegrations.mockResolvedValue(null)
  mockGetConnectedTaskServices.mockResolvedValue([])

  await updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)

  expect(zrem).not.toHaveBeenCalled()
  expect(set).not.toHaveBeenCalled()
})

test('resolves and logs when zrem rejects instead of crashing the caller', async () => {
  const gitlabA: GitLabProject = {
    id: 'lA',
    service: 'gitlab',
    __typename: 'Project',
    fullPath: 'o/lA'
  }
  const gitlabRepo: GitLabProject = {
    id: 'l1',
    service: 'gitlab',
    __typename: 'Project',
    fullPath: 'o/l1'
  }
  mockGetAllCachedRepoIntegrations.mockResolvedValue([gitlabRepo])
  mockGetPrevUsedRepoIntegrations.mockResolvedValue([gitlabA])
  mockGetConnectedTaskServices.mockResolvedValue([])
  const rejection = new Error('zrem failed')
  zrem.mockRejectedValue(rejection)

  await expect(
    updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)
  ).resolves.toBeUndefined()

  expect(mockLogError).toHaveBeenCalledWith(rejection, {
    userId: viewerId,
    tags: {teamId}
  })
})

test('only clears the all-repos cache when an integration was added', async () => {
  await updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, true)

  expect(del).toHaveBeenCalledWith('allRepoIntegrations:t1:u1')
  expect(set).not.toHaveBeenCalled()
  expect(zrem).not.toHaveBeenCalled()
  expect(mockGetConnectedTaskServices).not.toHaveBeenCalled()
})
