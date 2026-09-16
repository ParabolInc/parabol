import getPrevUsedRepoIntegrations from '../../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import getRedis from '../../utils/getRedis'
import loadServiceRepoIntegrations from '../loadServiceRepoIntegrations'
import type {GitHubRepo} from '../platform/RemoteRepoIntegration'
import type {GqlIntegrationCtx} from '../platform/ServerIntegrationDefinition'
import updatePrevUsedRepoIntegrationsCache from '../updatePrevUsedRepoIntegrationsCache'

jest.mock('../../graphql/queries/helpers/getPrevUsedRepoIntegrations', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../loadServiceRepoIntegrations', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../platform/registry', () => ({isRegisteredServerIntegration: () => true}))
jest.mock('../platform/getRepoListCapability', () => ({
  __esModule: true,
  default: () => ({integrationRepoId: ({nameWithOwner}: GitHubRepo) => nameWithOwner})
}))

const mockGetPrevUsed = getPrevUsedRepoIntegrations as jest.MockedFunction<
  typeof getPrevUsedRepoIntegrations
>
const mockGetRedis = getRedis as jest.MockedFunction<typeof getRedis>
const mockLoadRepos = loadServiceRepoIntegrations as jest.MockedFunction<
  typeof loadServiceRepoIntegrations
>

const zadd = jest.fn()
const pexpire = jest.fn()
const makeGitHubRepo = (nameWithOwner: string): GitHubRepo => ({
  hasIssuesEnabled: true,
  nameWithOwner,
  updatedAt: new Date('2026-01-01'),
  viewerCanAdminister: false,
  service: 'github'
})
const githubRepo = makeGitHubRepo('o/a')
const otherGithubRepo = makeGitHubRepo('o/b')
const ctx = {teamId: 't1', userId: 'u1'} as GqlIntegrationCtx

beforeEach(() => {
  jest.clearAllMocks()
  mockGetRedis.mockReturnValue({zadd, pexpire} as unknown as ReturnType<typeof getRedis>)
})

test('a repo already in the prev-used list is bumped without loading the service list', async () => {
  mockGetPrevUsed.mockResolvedValue([otherGithubRepo, githubRepo])
  await updatePrevUsedRepoIntegrationsCache('github', 'o/a', ctx)
  expect(mockLoadRepos).not.toHaveBeenCalled()
  expect(zadd).toHaveBeenCalledWith(
    'prevUsedRepoIntegrations:t1',
    expect.any(Number),
    JSON.stringify(githubRepo)
  )
  expect(pexpire).toHaveBeenCalledWith('prevUsedRepoIntegrations:t1', 180 * 24 * 60 * 60 * 1000)
})

test('a repo new to the prev-used list is found in the service list and added', async () => {
  mockGetPrevUsed.mockResolvedValue([otherGithubRepo])
  mockLoadRepos.mockResolvedValue([otherGithubRepo, githubRepo])
  await updatePrevUsedRepoIntegrationsCache('github', 'o/a', ctx)
  expect(mockLoadRepos).toHaveBeenCalledWith('github', ctx)
  expect(zadd).toHaveBeenCalledWith(
    'prevUsedRepoIntegrations:t1',
    expect.any(Number),
    JSON.stringify(githubRepo)
  )
})

test('a repo in neither list is ignored', async () => {
  mockGetPrevUsed.mockResolvedValue(null)
  mockLoadRepos.mockResolvedValue(null)
  await updatePrevUsedRepoIntegrationsCache('github', 'o/a', ctx)
  expect(zadd).not.toHaveBeenCalled()
  expect(pexpire).not.toHaveBeenCalled()
})
