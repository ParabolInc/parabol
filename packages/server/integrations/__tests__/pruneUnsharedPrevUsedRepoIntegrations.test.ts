import getPrevUsedRepoIntegrations from '../../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import getRedis from '../../utils/getRedis'
import logError from '../../utils/logError'
import type {AzureDevOpsProject} from '../azureDevOps/fetchAvailableAzureDevOpsProjects'
import type {GitHubRepo} from '../platform/RemoteRepoIntegration'
import RepoAccess from '../platform/RepoAccess'
import pruneUnsharedPrevUsedRepoIntegrations from '../pruneUnsharedPrevUsedRepoIntegrations'

jest.mock('../platform/getRepoListCapability', () => ({
  __esModule: true,
  default: () => ({
    integrationRepoId: ({instanceId, projectId}: AzureDevOpsProject) => `${instanceId}:${projectId}`
  })
}))
jest.mock('../../utils/getRedis', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../graphql/queries/helpers/getPrevUsedRepoIntegrations', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockGetRedis = jest.mocked(getRedis)
const mockGetPrevUsed = jest.mocked(getPrevUsedRepoIntegrations)
const zrem = jest.fn().mockResolvedValue(0)

const ACME = 'dev.azure.com/acme'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const API_PROJECT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'

const project = (projectId: string, name: string, userId: string): AzureDevOpsProject => ({
  service: 'azureDevOps',
  instanceId: ACME,
  projectId,
  name,
  teamId: 't1',
  userId
})
const aliceWeb = project(WEB_PROJECT_ID, 'Web', 'alice')
const aliceApi = project(API_PROJECT_ID, 'Api', 'alice')
const bobApi = project(API_PROJECT_ID, 'Api', 'bob')
const githubRepo: GitHubRepo = {
  hasIssuesEnabled: true,
  nameWithOwner: 'o/g',
  updatedAt: new Date('2026-01-01'),
  viewerCanAdminister: false,
  service: 'github'
}
const sharesWeb = new RepoAccess('selected', [{id: `${ACME}:${WEB_PROJECT_ID}`, name: 'Web'}])

beforeEach(() => {
  jest.clearAllMocks()
  mockGetRedis.mockReturnValue({zrem} as unknown as ReturnType<typeof getRedis>)
})

test('forgets only the entries this user added and no longer shares', async () => {
  mockGetPrevUsed.mockResolvedValue([aliceWeb, aliceApi, bobApi, githubRepo])
  await pruneUnsharedPrevUsedRepoIntegrations('t1', 'alice', 'azureDevOps', sharesWeb)
  expect(zrem).toHaveBeenCalledTimes(1)
  expect(zrem).toHaveBeenCalledWith('prevUsedRepoIntegrations:t1', [JSON.stringify(aliceApi)])
})

test('forgets nothing when everything the user added is still shared', async () => {
  mockGetPrevUsed.mockResolvedValue([aliceWeb, bobApi])
  await pruneUnsharedPrevUsedRepoIntegrations('t1', 'alice', 'azureDevOps', sharesWeb)
  expect(zrem).not.toHaveBeenCalled()
})

test('does not read the prev-used list when the connection shares everything', async () => {
  await pruneUnsharedPrevUsedRepoIntegrations(
    't1',
    'alice',
    'azureDevOps',
    new RepoAccess('all', [])
  )
  expect(mockGetPrevUsed).not.toHaveBeenCalled()
})

test('resolves and logs when redis rejects', async () => {
  const rejection = new Error('redis down')
  mockGetPrevUsed.mockRejectedValue(rejection)
  await expect(
    pruneUnsharedPrevUsedRepoIntegrations('t1', 'alice', 'azureDevOps', sharesWeb)
  ).resolves.toBeUndefined()
  expect(logError).toHaveBeenCalledWith(rejection, {
    userId: 'alice',
    tags: {teamId: 't1', service: 'azureDevOps'}
  })
})
