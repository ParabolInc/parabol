import getPrevUsedRepoIntegrations from '../../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import getRedis from '../../utils/getRedis'
import logError from '../../utils/logError'
import invalidateRepoIntegrationsCache from '../invalidateRepoIntegrationsCache'
import type {GitHubRepo, GitLabProject} from '../platform/RemoteRepoIntegration'

jest.mock('../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../graphql/queries/helpers/getPrevUsedRepoIntegrations', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockGetRedis = getRedis as jest.MockedFunction<typeof getRedis>
const mockGetPrevUsed = getPrevUsedRepoIntegrations as jest.MockedFunction<
  typeof getPrevUsedRepoIntegrations
>
const del = jest.fn().mockResolvedValue(1)
const zrem = jest.fn().mockResolvedValue(0)
const githubRepo: GitHubRepo = {id: 'o/g', service: 'github', nameWithOwner: 'o/g'}
const gitlabA: GitLabProject = {id: 'a', service: 'gitlab', __typename: 'Project', fullPath: 'o/a'}
const gitlabB: GitLabProject = {id: 'b', service: 'gitlab', __typename: 'Project', fullPath: 'o/b'}

beforeEach(() => {
  jest.clearAllMocks()
  del.mockResolvedValue(1)
  zrem.mockResolvedValue(0)
  mockGetRedis.mockReturnValue({del, zrem} as unknown as ReturnType<typeof getRedis>)
})

test('connecting a service only drops that service key', async () => {
  await invalidateRepoIntegrationsCache('t1', 'u1', 'gitlab', 'added')
  expect(del).toHaveBeenCalledWith('repoIntegrations:gitlab:t1:u1')
  expect(mockGetPrevUsed).not.toHaveBeenCalled()
  expect(zrem).not.toHaveBeenCalled()
})

test('disconnecting drops the key and the team prev-used entries for that service in one zrem', async () => {
  mockGetPrevUsed.mockResolvedValue([gitlabA, githubRepo, gitlabB])
  await invalidateRepoIntegrationsCache('t1', 'u1', 'gitlab', 'removed')
  expect(del).toHaveBeenCalledWith('repoIntegrations:gitlab:t1:u1')
  expect(zrem).toHaveBeenCalledTimes(1)
  expect(zrem).toHaveBeenCalledWith('prevUsedRepoIntegrations:t1', [
    JSON.stringify(gitlabA),
    JSON.stringify(gitlabB)
  ])
})

test('does not call zrem when no prev-used entry belongs to the service', async () => {
  mockGetPrevUsed.mockResolvedValue([githubRepo])
  await invalidateRepoIntegrationsCache('t1', 'u1', 'gitlab', 'removed')
  expect(zrem).not.toHaveBeenCalled()
})

test('resolves and logs when redis rejects', async () => {
  const rejection = new Error('redis down')
  del.mockRejectedValue(rejection)
  await expect(
    invalidateRepoIntegrationsCache('t1', 'u1', 'gitlab', 'removed')
  ).resolves.toBeUndefined()
  expect(logError).toHaveBeenCalledWith(rejection, {
    userId: 'u1',
    tags: {teamId: 't1', service: 'gitlab'}
  })
})
