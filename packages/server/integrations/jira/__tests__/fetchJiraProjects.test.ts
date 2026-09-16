import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import type {RepoFetchCtx} from '../../platform/ServerIntegrationDefinition'
import fetchJiraProjects, {fetchJiraProjectsResult} from '../fetchJiraProjects'

jest.mock('../../../utils/AtlassianServerManager')

const MockManager = AtlassianServerManager as jest.MockedClass<typeof AtlassianServerManager>
const getCloudNameLookup = jest.fn()
const getAllProjects = jest.fn()
const authLoad = jest.fn()
const ctx = {
  dataLoader: {get: () => ({load: authLoad})},
  teamId: 't1',
  userId: 'u1'
} as unknown as RepoFetchCtx

beforeEach(() => {
  jest.clearAllMocks()
  MockManager.mockImplementation(
    () => ({getCloudNameLookup, getAllProjects}) as unknown as AtlassianServerManager
  )
  authLoad.mockResolvedValue({accessToken: 'tok'})
})

test('a failed site lookup is an Error, not an empty project list', async () => {
  const failure = new Error('accessible-resources 429')
  getCloudNameLookup.mockResolvedValue(failure)
  await expect(fetchJiraProjects(ctx)).resolves.toBe(failure)
  expect(getAllProjects).not.toHaveBeenCalled()
})

test('a failed page is an Error for the capability but keeps the partial list for the loaders', async () => {
  getCloudNameLookup.mockResolvedValue({c1: 'Site'})
  const failure = new Error('page 2 timed out')
  getAllProjects.mockResolvedValue({projects: [{key: 'P', cloudId: 'c1'}], error: failure})
  await expect(fetchJiraProjects(ctx)).resolves.toBe(failure)
  await expect(fetchJiraProjectsResult(ctx)).resolves.toEqual({
    projects: [expect.objectContaining({key: 'P', id: 'c1:P', service: 'jira'})],
    error: failure
  })
})

test('maps projects into the cached repo shape', async () => {
  getCloudNameLookup.mockResolvedValue({c1: 'Site'})
  getAllProjects.mockResolvedValue({projects: [{key: 'P', cloudId: 'c1', name: 'Proj'}]})
  await expect(fetchJiraProjects(ctx)).resolves.toEqual([
    {key: 'P', cloudId: 'c1', name: 'Proj', id: 'c1:P', userId: 'u1', teamId: 't1', service: 'jira'}
  ])
  expect(getAllProjects).toHaveBeenCalledWith(['c1'])
})

test('is [] without touching Jira when the user has no usable auth', async () => {
  authLoad.mockResolvedValue(null)
  await expect(fetchJiraProjects(ctx)).resolves.toEqual([])
  expect(MockManager).not.toHaveBeenCalled()
})
