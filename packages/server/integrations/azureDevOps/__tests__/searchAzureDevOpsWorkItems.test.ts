jest.mock('../getAzureDevOpsManager', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../loadServiceRepoIntegrations', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))

import logError from '../../../utils/logError'
import loadServiceRepoIntegrations from '../../loadServiceRepoIntegrations'
import RepoAccess from '../../platform/RepoAccess'
import type {GqlIntegrationCtx} from '../../platform/ServerIntegrationDefinition'
import type {AzureDevOpsSharedWorkItem} from '../AzureDevOpsServerManager'
import type {AzureDevOpsProject} from '../fetchAvailableAzureDevOpsProjects'
import getAzureDevOpsManager from '../getAzureDevOpsManager'
import searchAzureDevOpsWorkItems, {
  NO_SHARED_PROJECTS_MESSAGE,
  PROJECTS_UNAVAILABLE_MESSAGE
} from '../searchAzureDevOpsWorkItems'

const mockedGetManager = jest.mocked(getAzureDevOpsManager)
const mockedLoadRepos = jest.mocked(loadServiceRepoIntegrations)

const ACME = 'dev.azure.com/acme'
const GLOBEX = 'dev.azure.com/globex'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const API_PROJECT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
const BILLING_PROJECT_ID = 'c3d4e5f6-a7b8-4c9d-8e1f-2a3b4c5d6e7f'
const OPS_PROJECT_ID = 'd4e5f6a7-b8c9-4d0e-9f2a-3b4c5d6e7f8a'
const WEB_ID = `${ACME}:${WEB_PROJECT_ID}`
const API_ID = `${ACME}:${API_PROJECT_ID}`
const BILLING_ID = `${ACME}:${BILLING_PROJECT_ID}`
const OPS_ID = `${GLOBEX}:${OPS_PROJECT_ID}`
const WHERE = "[System.State] = 'Active'"
const DEFAULT_ORDER = 'ORDER BY [System.ChangedDate] DESC'

const ctx = {teamId: 'team1', userId: 'user1', dataLoader: {}} as unknown as GqlIntegrationCtx

const sharesWebAndApi = new RepoAccess('selected', [
  {id: WEB_ID, name: 'Web'},
  {id: API_ID, name: 'Api'}
])
const sharesTwoOrganizations = new RepoAccess('selected', [
  {id: WEB_ID, name: 'Web'},
  {id: OPS_ID, name: 'Ops'}
])
const sharesEverything = new RepoAccess('all', [])

const accountProject = (
  instanceId: string,
  projectId: string,
  name: string
): AzureDevOpsProject => ({
  service: 'azureDevOps',
  instanceId,
  projectId,
  name,
  teamId: 'team1',
  userId: 'user1'
})

const sharedWorkItem = (
  id: number,
  projectId: string,
  changedDate: string,
  instanceId = ACME
): AzureDevOpsSharedWorkItem => ({
  id,
  project: {projectId, projectName: projectId === WEB_PROJECT_ID ? 'Web' : 'Api'},
  url: `https://${instanceId}/${projectId}/_apis/wit/workItems/${id}`,
  fields: {
    'System.TeamProject': projectId === WEB_PROJECT_ID ? 'Web' : 'Api',
    'System.Title': `Work item ${id}`,
    'System.State': 'Active',
    'System.WorkItemType': 'User Story',
    'System.ChangedDate': changedDate
  }
})

const useManager = (access: RepoAccess) => {
  const manager = {
    access,
    queryWorkItemIds: jest.fn<Promise<number[] | Error>, [string, string | null, string, number]>(),
    getWorkItems: jest.fn<Promise<AzureDevOpsSharedWorkItem[] | Error>, [string, number[]]>(),
    listOrganizations: jest.fn(),
    listProjects: jest.fn()
  }
  manager.queryWorkItemIds.mockResolvedValue([])
  mockedGetManager.mockResolvedValue(
    manager as unknown as Awaited<ReturnType<typeof getAzureDevOpsManager>>
  )
  return manager
}

const useCachedProjects = (projects: AzureDevOpsProject[] | null) => {
  mockedLoadRepos.mockResolvedValue(projects)
}

const useAcmeProjects = () =>
  useCachedProjects([
    accountProject(ACME, API_PROJECT_ID, 'Api'),
    accountProject(ACME, WEB_PROJECT_ID, 'Web')
  ])

const search = (projects: string[] = [], options: {limit?: number; orderBy?: string} = {}) =>
  searchAzureDevOpsWorkItems(ctx, {where: WHERE, limit: 25, projects, ...options})

const unwrap = (res: Awaited<ReturnType<typeof search>>) => {
  if (res instanceof Error) throw res
  return res
}

const idsOf = (res: Awaited<ReturnType<typeof search>>) => unwrap(res).map(({id}) => id)

const projectsIn = (names: string[]) =>
  `[System.TeamProject] IN (${names.map((name) => `'${name}'`).join(', ')})`

const queriedProjects = (manager: ReturnType<typeof useManager>) =>
  manager.queryWorkItemIds.mock.calls.map(([instanceId, , query]) => [
    instanceId,
    /\[System\.TeamProject\] IN \((.*?)\)/.exec(query)?.[1] ?? null
  ])

beforeEach(() => {
  mockedLoadRepos.mockReset()
})

describe('searchAzureDevOpsWorkItems', () => {
  it('fails when Azure DevOps is not connected', async () => {
    mockedGetManager.mockResolvedValue(null)
    await expect(search()).resolves.toBeInstanceOf(Error)
  })

  it('searches an organization’s shared projects in one query and keeps the order it returns', async () => {
    const manager = useManager(sharesWebAndApi)
    manager.queryWorkItemIds.mockResolvedValue([3, 1, 4, 2])
    manager.getWorkItems.mockResolvedValue([
      sharedWorkItem(1, WEB_PROJECT_ID, '2026-10-01T00:00:00Z'),
      sharedWorkItem(2, WEB_PROJECT_ID, '2026-10-04T00:00:00Z'),
      sharedWorkItem(3, API_PROJECT_ID, '2026-10-03T00:00:00Z'),
      sharedWorkItem(4, API_PROJECT_ID, '2026-10-02T00:00:00Z')
    ])

    const workItems = unwrap(await search([], {limit: 3, orderBy: 'ORDER BY [System.Id] ASC'}))

    expect(workItems.map(({id}) => id)).toEqual(['3', '1', '4'])
    expect(manager.queryWorkItemIds.mock.calls).toEqual([
      [
        ACME,
        null,
        `SELECT [System.Id] FROM WorkItems WHERE (${WHERE}) AND ${projectsIn(['Web', 'Api'])} ORDER BY [System.Id] ASC`,
        3
      ]
    ])
    expect(manager.getWorkItems).toHaveBeenCalledWith(ACME, [3, 1, 4, 2])
    expect(workItems[0]).toMatchObject({
      service: 'azureDevOps',
      instanceId: ACME,
      teamProject: API_PROJECT_ID,
      projectName: 'Api',
      teamId: 'team1',
      userId: 'user1'
    })
  })

  it('merges organizations newest-first when no ordering is requested', async () => {
    const manager = useManager(sharesTwoOrganizations)
    manager.queryWorkItemIds.mockImplementation(async (instanceId) =>
      instanceId === ACME ? [2, 1] : [3]
    )
    manager.getWorkItems.mockImplementation(async (instanceId) =>
      instanceId === ACME
        ? [
            sharedWorkItem(1, WEB_PROJECT_ID, '2026-10-01T00:00:00Z'),
            sharedWorkItem(2, WEB_PROJECT_ID, '2026-10-04T00:00:00Z')
          ]
        : [sharedWorkItem(3, OPS_PROJECT_ID, '2026-10-03T00:00:00Z', GLOBEX)]
    )
    expect(idsOf(await search([], {limit: 2}))).toEqual(['2', '3'])
  })

  it('takes each organization’s best matches in turn when an ordering is requested', async () => {
    const manager = useManager(sharesTwoOrganizations)
    manager.queryWorkItemIds.mockImplementation(async (instanceId) =>
      instanceId === ACME ? [1, 2] : [3, 4]
    )
    manager.getWorkItems.mockImplementation(async (instanceId) =>
      instanceId === ACME
        ? [
            sharedWorkItem(1, WEB_PROJECT_ID, '2026-10-01T00:00:00Z'),
            sharedWorkItem(2, WEB_PROJECT_ID, '2026-10-02T00:00:00Z')
          ]
        : [
            sharedWorkItem(3, OPS_PROJECT_ID, '2026-10-03T00:00:00Z', GLOBEX),
            sharedWorkItem(4, OPS_PROJECT_ID, '2026-10-04T00:00:00Z', GLOBEX)
          ]
    )
    const res = await search([], {limit: 3, orderBy: 'ORDER BY [Microsoft.VSTS.Common.Priority]'})
    expect(idsOf(res)).toEqual(['1', '3', '2'])
  })

  it('skips an organization that fails when another returns results', async () => {
    const manager = useManager(sharesTwoOrganizations)
    const organizationError = new Error('TF400813: The user is not authorized')
    manager.queryWorkItemIds.mockImplementation(async (instanceId) =>
      instanceId === ACME ? organizationError : [7]
    )
    manager.getWorkItems.mockResolvedValue([
      sharedWorkItem(7, OPS_PROJECT_ID, '2026-10-02T00:00:00Z', GLOBEX)
    ])

    expect(idsOf(await search())).toEqual(['7'])
    expect(manager.getWorkItems).toHaveBeenCalledWith(GLOBEX, [7])
    expect(logError).toHaveBeenCalledWith(
      organizationError,
      expect.objectContaining({userId: 'user1'})
    )
  })

  it('returns the Error when every organization fails', async () => {
    const manager = useManager(sharesTwoOrganizations)
    manager.queryWorkItemIds.mockResolvedValue(new Error('Azure DevOps took too long to respond'))
    const res = await search()
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', 'Azure DevOps took too long to respond')
  })

  it('splits an organization with more projects than one query can name', async () => {
    const grants = Array.from({length: 201}, (_, idx) => ({
      id: `${ACME}:${WEB_PROJECT_ID.slice(0, -3)}${String(idx).padStart(3, '0')}`,
      name: `Project ${idx}`
    }))
    const manager = useManager(new RepoAccess('selected', grants))
    await search()
    expect(manager.queryWorkItemIds).toHaveBeenCalledTimes(2)
    expect(manager.queryWorkItemIds.mock.calls[1]![2]).toContain(projectsIn(['Project 200']))
  })
})

describe('searchAzureDevOpsWorkItems on a connection that shares chosen projects', () => {
  it('tells a connection that shares no project to choose some, without searching', async () => {
    const manager = useManager(new RepoAccess('selected', []))
    const res = await search([WEB_ID])
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', NO_SHARED_PROJECTS_MESSAGE)
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
  })

  it('answers from the connection’s own record, without listing the account', async () => {
    const manager = useManager(sharesWebAndApi)
    await expect(search()).resolves.toEqual([])
    expect(manager.queryWorkItemIds.mock.calls).toEqual([
      [
        ACME,
        null,
        `SELECT [System.Id] FROM WorkItems WHERE (${WHERE}) AND ${projectsIn(['Web', 'Api'])} ${DEFAULT_ORDER}`,
        25
      ]
    ])
    expect(mockedLoadRepos).not.toHaveBeenCalled()
    expect(manager.listOrganizations).not.toHaveBeenCalled()
    expect(manager.getWorkItems).not.toHaveBeenCalled()
  })

  it.each([
    ['its name', 'api'],
    ['its integrationRepoId', API_ID.toUpperCase()]
  ])('narrows to a shared project by %s, ignoring case', async (_label, project) => {
    const manager = useManager(sharesWebAndApi)
    await search([project])
    expect(queriedProjects(manager)).toEqual([[ACME, "'Api'"]])
  })

  it('takes names and integrationRepoIds in the same filter', async () => {
    const manager = useManager(sharesWebAndApi)
    await search(['API', WEB_ID])
    expect(queriedProjects(manager)).toEqual([[ACME, "'Web', 'Api'"]])
  })

  it('names a project once when its name and its id are both given', async () => {
    const manager = useManager(sharesWebAndApi)
    await search(['Web', WEB_ID])
    expect(queriedProjects(manager)).toEqual([[ACME, "'Web'"]])
  })

  it.each([
    ['the name of a project that is not shared', ['Billing']],
    ['the well-formed id of a project that is not shared', [BILLING_ID]],
    ['a shared project id under another organization', [`${GLOBEX}:${WEB_PROJECT_ID}`]]
  ])('searches nothing for %s', async (_label, projects) => {
    const manager = useManager(sharesWebAndApi)
    await expect(search(projects)).resolves.toEqual([])
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
  })

  it('searches only the shared entries of a filter that also names unshared ones', async () => {
    const manager = useManager(sharesWebAndApi)
    await search(['Web', 'Billing', BILLING_ID])
    expect(queriedProjects(manager)).toEqual([[ACME, "'Web'"]])
  })
})

describe('searchAzureDevOpsWorkItems on a connection that shares everything', () => {
  it('searches each organization as a whole when no project is named', async () => {
    const manager = useManager(sharesEverything)
    useCachedProjects([
      accountProject(ACME, WEB_PROJECT_ID, 'Web'),
      accountProject(ACME, API_PROJECT_ID, 'Api'),
      accountProject(GLOBEX, OPS_PROJECT_ID, 'Ops')
    ])
    manager.queryWorkItemIds.mockImplementation(async (instanceId) =>
      instanceId === ACME ? [1] : [2]
    )
    manager.getWorkItems.mockImplementation(async (instanceId) =>
      instanceId === ACME
        ? [sharedWorkItem(1, WEB_PROJECT_ID, '2026-10-01T00:00:00Z')]
        : [sharedWorkItem(2, OPS_PROJECT_ID, '2026-10-02T00:00:00Z', GLOBEX)]
    )

    expect(idsOf(await search())).toEqual(['2', '1'])

    const query = `SELECT [System.Id] FROM WorkItems WHERE (${WHERE}) ${DEFAULT_ORDER}`
    expect(manager.queryWorkItemIds.mock.calls).toEqual([
      [ACME, null, query, 25],
      [GLOBEX, null, query, 25]
    ])
  })

  it('reads the account’s projects from the cached repo list, never live', async () => {
    const manager = useManager(sharesEverything)
    useAcmeProjects()
    await search(['WEB'])
    expect(mockedLoadRepos).toHaveBeenCalledWith('azureDevOps', ctx)
    expect(manager.listOrganizations).not.toHaveBeenCalled()
    expect(manager.listProjects).not.toHaveBeenCalled()
    expect(queriedProjects(manager)).toEqual([[ACME, "'Web'"]])
  })

  it('takes names and integrationRepoIds in the same filter', async () => {
    const manager = useManager(sharesEverything)
    useAcmeProjects()
    await search(['web', API_ID.toUpperCase()])
    expect(queriedProjects(manager)).toEqual([[ACME, "'Api', 'Web'"]])
  })

  it('names a project once when its integrationRepoId is repeated', async () => {
    const manager = useManager(sharesEverything)
    useAcmeProjects()
    await search([WEB_ID, WEB_ID.toUpperCase()])
    expect(queriedProjects(manager)).toEqual([[ACME, "'Web'"]])
  })

  it.each([
    ['an id the account cannot see', BILLING_ID],
    ['an organization without a project', ACME],
    ['an id with an empty project', `${ACME}:`],
    ['an id with an empty organization', `:${API_PROJECT_ID}`],
    ['an id on another host', `evil.example/acme:${API_PROJECT_ID}`]
  ])('matches nothing for %s, and still searches the rest', async (_label, unmatched) => {
    const manager = useManager(sharesEverything)
    useAcmeProjects()
    await search([unmatched, WEB_ID])
    expect(queriedProjects(manager)).toEqual([[ACME, "'Web'"]])
  })

  it('searches nothing, rather than everything, when no entry matches a project', async () => {
    const manager = useManager(sharesEverything)
    useAcmeProjects()
    await expect(search([ACME, 'Billing'])).resolves.toEqual([])
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
  })

  it('fails when the account’s projects cannot be listed', async () => {
    const manager = useManager(sharesEverything)
    useCachedProjects(null)
    const res = await search(['Web'])
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', PROJECTS_UNAVAILABLE_MESSAGE)
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
  })
})
