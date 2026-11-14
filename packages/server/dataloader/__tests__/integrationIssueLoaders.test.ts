jest.mock('../../integrations/azureDevOps/getAzureDevOpsManager', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../integrations/clickup/fetchClickUpTask', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../utils/logError', () => ({__esModule: true, default: jest.fn()}))

import type {AzureDevOpsSharedWorkItem} from '../../integrations/azureDevOps/AzureDevOpsServerManager'
import getAzureDevOpsManager from '../../integrations/azureDevOps/getAzureDevOpsManager'
import fetchClickUpTask from '../../integrations/clickup/fetchClickUpTask'
import logError from '../../utils/logError'
import {integrationIssue} from '../integrationIssueLoaders'
import type RootDataLoader from '../RootDataLoader'

const mockedGetManager = jest.mocked(getAzureDevOpsManager)
const mockedFetchClickUpTask = jest.mocked(fetchClickUpTask)

const ACME = 'dev.azure.com/acme'
const GLOBEX = 'dev.azure.com/globex'
const PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'

const parent = {
  dataLoaderOptions: {},
  get: () => ({load: async () => ({accessToken: 'token'})})
} as unknown as RootDataLoader

const sharedWorkItem = (id: number, instanceId: string): AzureDevOpsSharedWorkItem => ({
  id,
  project: {projectId: PROJECT_ID, projectName: 'Web'},
  url: `https://${instanceId}/${PROJECT_ID}/_apis/wit/workItems/${id}`,
  fields: {'System.Title': `Issue ${id}`}
})

const azureDevOpsKey = (issueKey: string, instanceId = ACME, accessUserId = 'user1') => ({
  teamId: 'team1',
  integration: {
    service: 'azureDevOps' as const,
    accessUserId,
    instanceId,
    projectKey: PROJECT_ID,
    issueKey
  }
})

const clickUpKey = (taskId: string) => ({
  teamId: 'team1',
  integration: {service: 'clickup' as const, accessUserId: 'user1', workspaceId: '1', taskId}
})

const useManager = () => {
  const getIssues = jest.fn(async (instanceId: string, issueKeys: readonly (string | number)[]) =>
    issueKeys.map((issueKey) => sharedWorkItem(Number(issueKey), instanceId))
  )
  mockedGetManager.mockResolvedValue({getIssues} as unknown as Awaited<
    ReturnType<typeof getAzureDevOpsManager>
  >)
  return getIssues
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('integrationIssue', () => {
  it('reads the issues of one connection in one request per organization', async () => {
    const getIssues = useManager()
    const loader = integrationIssue(parent)

    const issues = await Promise.all([
      loader.load(azureDevOpsKey('1')),
      loader.load(azureDevOpsKey('7', GLOBEX)),
      loader.load(azureDevOpsKey('2'))
    ])

    expect(issues).toEqual([
      expect.objectContaining({service: 'azureDevOps', id: '1', instanceId: ACME}),
      expect.objectContaining({service: 'azureDevOps', id: '7', instanceId: GLOBEX}),
      expect.objectContaining({service: 'azureDevOps', id: '2', instanceId: ACME})
    ])
    expect(mockedGetManager).toHaveBeenCalledTimes(1)
    expect(getIssues.mock.calls).toEqual([
      [ACME, ['1', '2']],
      [GLOBEX, ['7']]
    ])
  })

  it('reads each service and each access user through its own connection', async () => {
    useManager()
    mockedFetchClickUpTask.mockImplementation(async (_auth, taskId) => {
      return {service: 'clickup', taskId} as Awaited<ReturnType<typeof fetchClickUpTask>>
    })
    const loader = integrationIssue(parent)

    const issues = await Promise.all([
      loader.load(azureDevOpsKey('1')),
      loader.load(clickUpKey('86abc')),
      loader.load(azureDevOpsKey('1', ACME, 'user2'))
    ])

    expect(issues).toEqual([
      expect.objectContaining({service: 'azureDevOps', id: '1', userId: 'user1'}),
      {service: 'clickup', taskId: '86abc'},
      expect.objectContaining({service: 'azureDevOps', id: '1', userId: 'user2'})
    ])
    expect(mockedGetManager.mock.calls.map(([{userId}]) => userId)).toEqual(['user1', 'user2'])
  })

  it('returns null for an issue the connection cannot read', async () => {
    const getIssues = useManager()
    getIssues.mockResolvedValue([sharedWorkItem(1, ACME)])
    const loader = integrationIssue(parent)

    await expect(
      Promise.all([loader.load(azureDevOpsKey('1')), loader.load(azureDevOpsKey('2'))])
    ).resolves.toEqual([expect.objectContaining({id: '1'}), null])
  })

  it('logs a connection that throws and still answers the others', async () => {
    const connectionError = new Error('redis is down')
    mockedGetManager.mockRejectedValue(connectionError)
    mockedFetchClickUpTask.mockImplementation(async (_auth, taskId) => {
      return {service: 'clickup', taskId} as Awaited<ReturnType<typeof fetchClickUpTask>>
    })
    const loader = integrationIssue(parent)

    await expect(
      Promise.all([loader.load(azureDevOpsKey('1')), loader.load(clickUpKey('86abc'))])
    ).resolves.toEqual([null, {service: 'clickup', taskId: '86abc'}])
    expect(logError).toHaveBeenCalledWith(connectionError, {
      userId: 'user1',
      tags: {teamId: 'team1', service: 'azureDevOps'}
    })
  })
})
