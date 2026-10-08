jest.mock('../getAzureDevOpsManager', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))

import logError from '../../../utils/logError'
import RepoAccess from '../../platform/RepoAccess'
import type {RepoFetchCtx} from '../../platform/ServerIntegrationDefinition'
import type {AzureDevOpsRawWorkItem} from '../AzureDevOpsServerManager'
import getAzureDevOpsManager from '../getAzureDevOpsManager'
import searchAzureDevOpsWorkItems, {NO_SHARED_PROJECTS_MESSAGE} from '../searchAzureDevOpsWorkItems'

const mockedGetManager = jest.mocked(getAzureDevOpsManager)

const ACME = 'dev.azure.com/acme'
const GLOBEX = 'dev.azure.com/globex'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const API_PROJECT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
const BILLING_PROJECT_ID = 'c3d4e5f6-a7b8-4c9d-8e1f-2a3b4c5d6e7f'
const WEB_ID = `${ACME}:${WEB_PROJECT_ID}`
const API_ID = `${ACME}:${API_PROJECT_ID}`
const BILLING_ID = `${ACME}:${BILLING_PROJECT_ID}`
const WHERE = "[System.State] = 'Active'"

const ctx = {teamId: 'team1', userId: 'user1', dataLoader: {}} as unknown as RepoFetchCtx

const sharesWebAndApi = new RepoAccess('selected', [
  {id: WEB_ID, name: 'Web'},
  {id: API_ID, name: 'Api'}
])
const sharesEverything = new RepoAccess('all', [])

const rawWorkItem = (
  id: number,
  projectId: string,
  changedDate: string,
  instanceId = ACME
): AzureDevOpsRawWorkItem => ({
  id,
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
    getWorkItems: jest.fn<Promise<AzureDevOpsRawWorkItem[] | Error>, [string, number[]]>(),
    listOrganizations: jest.fn(),
    listProjects: jest.fn()
  }
  manager.queryWorkItemIds.mockResolvedValue([])
  mockedGetManager.mockResolvedValue(
    manager as unknown as Awaited<ReturnType<typeof getAzureDevOpsManager>>
  )
  return manager
}

const useAccountProjects = (manager: ReturnType<typeof useManager>) => {
  manager.listOrganizations.mockResolvedValue([{accountId: 'account1', accountName: 'acme'}])
  manager.listProjects.mockResolvedValue([
    {id: WEB_PROJECT_ID, name: 'Web'},
    {id: API_PROJECT_ID, name: 'Api'}
  ])
}

const search = (projects: string[] = [], options: {limit?: number; orderBy?: string} = {}) =>
  searchAzureDevOpsWorkItems(ctx, {where: WHERE, limit: 25, projects, ...options})

const unwrap = (res: Awaited<ReturnType<typeof search>>) => {
  if (res instanceof Error) throw res
  return res
}

const idsOf = (res: Awaited<ReturnType<typeof search>>) => unwrap(res).map(({id}) => id)

const queriedProjects = (manager: ReturnType<typeof useManager>) =>
  manager.queryWorkItemIds.mock.calls.map(([instanceId, projectId]) => [instanceId, projectId])

describe('searchAzureDevOpsWorkItems', () => {
  it('fails when Azure DevOps is not connected', async () => {
    mockedGetManager.mockResolvedValue(null)
    await expect(search()).resolves.toBeInstanceOf(Error)
  })

  it('merges the projects newest-first and caps the result at the limit', async () => {
    const manager = useManager(sharesWebAndApi)
    manager.queryWorkItemIds.mockImplementation(async (_instanceId, projectId) =>
      projectId === WEB_PROJECT_ID ? [1, 2] : [3, 4]
    )
    manager.getWorkItems.mockResolvedValue([
      rawWorkItem(1, WEB_PROJECT_ID, '2026-10-01T00:00:00Z'),
      rawWorkItem(2, WEB_PROJECT_ID, '2026-10-04T00:00:00Z'),
      rawWorkItem(3, API_PROJECT_ID, '2026-10-03T00:00:00Z'),
      rawWorkItem(4, API_PROJECT_ID, '2026-10-02T00:00:00Z')
    ])

    const workItems = unwrap(await search([], {limit: 3}))

    expect(workItems.map(({id}) => id)).toEqual(['2', '3', '4'])
    expect(manager.queryWorkItemIds.mock.calls.map(([, , , top]) => top)).toEqual([3, 3])
    expect(manager.getWorkItems).toHaveBeenCalledTimes(1)
    expect(manager.getWorkItems).toHaveBeenCalledWith(ACME, [1, 2, 3, 4])
    expect(workItems[0]).toMatchObject({
      service: 'azureDevOps',
      instanceId: ACME,
      teamProject: WEB_PROJECT_ID,
      projectName: 'Web',
      teamId: 'team1',
      userId: 'user1'
    })
  })

  it('keeps the order WIQL returned when a single project is searched', async () => {
    const manager = useManager(sharesWebAndApi)
    manager.queryWorkItemIds.mockResolvedValue([9, 5, 7])
    manager.getWorkItems.mockResolvedValue([
      rawWorkItem(5, WEB_PROJECT_ID, '2026-10-03T00:00:00Z'),
      rawWorkItem(7, WEB_PROJECT_ID, '2026-10-01T00:00:00Z'),
      rawWorkItem(9, WEB_PROJECT_ID, '2026-10-02T00:00:00Z')
    ])
    expect(idsOf(await search(['Web']))).toEqual(['9', '5', '7'])
  })

  it('skips a project that fails when another returns results', async () => {
    const manager = useManager(sharesWebAndApi)
    const projectError = new Error('TF401019: The project is disabled')
    manager.queryWorkItemIds.mockImplementation(async (_instanceId, projectId) =>
      projectId === WEB_PROJECT_ID ? projectError : [7]
    )
    manager.getWorkItems.mockResolvedValue([rawWorkItem(7, API_PROJECT_ID, '2026-10-02T00:00:00Z')])

    expect(idsOf(await search())).toEqual(['7'])
    expect(manager.getWorkItems).toHaveBeenCalledWith(ACME, [7])
    expect(logError).toHaveBeenCalledWith(projectError, expect.objectContaining({userId: 'user1'}))
  })

  it('returns the Error when every project fails', async () => {
    const manager = useManager(sharesWebAndApi)
    manager.queryWorkItemIds.mockResolvedValue(new Error('Azure DevOps took too long to respond'))
    const res = await search()
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', 'Azure DevOps took too long to respond')
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

  it('runs one project-pinned WIQL query per shared project', async () => {
    const manager = useManager(sharesWebAndApi)

    await expect(search([], {orderBy: 'ORDER BY [System.Id] ASC'})).resolves.toEqual([])

    const query = `SELECT [System.Id] FROM WorkItems WHERE (${WHERE}) AND [System.TeamProject] = @project ORDER BY [System.Id] ASC`
    expect(manager.queryWorkItemIds.mock.calls).toEqual([
      [ACME, WEB_PROJECT_ID, query, 25],
      [ACME, API_PROJECT_ID, query, 25]
    ])
    expect(manager.listOrganizations).not.toHaveBeenCalled()
    expect(manager.getWorkItems).not.toHaveBeenCalled()
  })

  it.each([
    ['its name', 'api'],
    ['its integrationRepoId', API_ID.toUpperCase()]
  ])('narrows to a shared project by %s, ignoring case', async (_label, project) => {
    const manager = useManager(sharesWebAndApi)
    await search([project])
    expect(queriedProjects(manager)).toEqual([[ACME, API_PROJECT_ID]])
  })

  it('takes names and integrationRepoIds in the same filter', async () => {
    const manager = useManager(sharesWebAndApi)
    await search(['API', WEB_ID])
    expect(queriedProjects(manager)).toEqual([
      [ACME, WEB_PROJECT_ID],
      [ACME, API_PROJECT_ID]
    ])
  })

  it('queries a project once when its name and its id are both given', async () => {
    const manager = useManager(sharesWebAndApi)
    await search(['Web', WEB_ID])
    expect(queriedProjects(manager)).toEqual([[ACME, WEB_PROJECT_ID]])
  })

  it.each([
    ['the name of a project that is not shared', ['Billing']],
    ['the well-formed id of a project that is not shared', [BILLING_ID]],
    ['a shared project id under another organization', [`${GLOBEX}:${WEB_PROJECT_ID}`]]
  ])('searches nothing for %s', async (_label, projects) => {
    const manager = useManager(sharesWebAndApi)
    await expect(search(projects)).resolves.toEqual([])
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
    expect(manager.listOrganizations).not.toHaveBeenCalled()
  })

  it('searches only the shared entries of a filter that also names unshared ones', async () => {
    const manager = useManager(sharesWebAndApi)
    await search(['Web', 'Billing', BILLING_ID])
    expect(queriedProjects(manager)).toEqual([[ACME, WEB_PROJECT_ID]])
  })
})

describe('searchAzureDevOpsWorkItems on a connection that shares everything', () => {
  it('searches each organization as a whole when no project is named', async () => {
    const manager = useManager(sharesEverything)
    manager.listOrganizations.mockResolvedValue([
      {accountId: 'account1', accountName: 'acme'},
      {accountId: 'account2', accountName: 'globex'}
    ])
    manager.queryWorkItemIds.mockImplementation(async (instanceId) =>
      instanceId === ACME ? [1] : [2]
    )
    manager.getWorkItems.mockImplementation(async (instanceId) =>
      instanceId === ACME
        ? [rawWorkItem(1, WEB_PROJECT_ID, '2026-10-01T00:00:00Z')]
        : [rawWorkItem(2, API_PROJECT_ID, '2026-10-02T00:00:00Z', GLOBEX)]
    )

    expect(idsOf(await search())).toEqual(['2', '1'])

    const query = `SELECT [System.Id] FROM WorkItems WHERE (${WHERE}) ORDER BY [System.ChangedDate] DESC`
    expect(manager.queryWorkItemIds.mock.calls).toEqual([
      [ACME, null, query, 25],
      [GLOBEX, null, query, 25]
    ])
    expect(manager.listProjects).not.toHaveBeenCalled()
  })

  it('fails when the organizations cannot be listed', async () => {
    const manager = useManager(sharesEverything)
    manager.listOrganizations.mockResolvedValue(new Error('Azure DevOps rejected the access token'))
    await expect(search()).resolves.toBeInstanceOf(Error)
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
  })

  it('queries well-formed integrationRepoIds directly, without discovering projects', async () => {
    const manager = useManager(sharesEverything)
    await search([WEB_ID, `${GLOBEX}:${API_PROJECT_ID}`])
    expect(manager.queryWorkItemIds.mock.calls).toEqual([
      [ACME, WEB_PROJECT_ID, expect.stringContaining('[System.TeamProject] = @project'), 25],
      [GLOBEX, API_PROJECT_ID, expect.stringContaining('[System.TeamProject] = @project'), 25]
    ])
    expect(manager.listOrganizations).not.toHaveBeenCalled()
    expect(manager.listProjects).not.toHaveBeenCalled()
  })

  it('queries a project once when its integrationRepoId is repeated', async () => {
    const manager = useManager(sharesEverything)
    await search([WEB_ID, WEB_ID.toUpperCase().replace('DEV.AZURE.COM', 'dev.azure.com')])
    expect(manager.queryWorkItemIds).toHaveBeenCalledTimes(1)
  })

  it('resolves a project name against the account’s projects', async () => {
    const manager = useManager(sharesEverything)
    useAccountProjects(manager)
    await search(['WEB'])
    expect(manager.listProjects).toHaveBeenCalledWith(ACME)
    expect(queriedProjects(manager)).toEqual([[ACME, WEB_PROJECT_ID]])
  })

  it('takes names and integrationRepoIds in the same filter, matching both by discovery', async () => {
    const manager = useManager(sharesEverything)
    useAccountProjects(manager)
    await search(['web', API_ID.toUpperCase()])
    expect(queriedProjects(manager)).toEqual([
      [ACME, API_PROJECT_ID],
      [ACME, WEB_PROJECT_ID]
    ])
  })

  it('does not query an id the account cannot see once a name forces discovery', async () => {
    const manager = useManager(sharesEverything)
    useAccountProjects(manager)
    await search(['Web', BILLING_ID])
    expect(queriedProjects(manager)).toEqual([[ACME, WEB_PROJECT_ID]])
  })

  it.each([
    ['an organization without a project', ACME],
    ['an id with an empty project', `${ACME}:`],
    ['an id with an empty organization', `:${API_PROJECT_ID}`],
    ['an id on another host', `evil.example/acme:${API_PROJECT_ID}`]
  ])(
    'matches nothing for %s, and falls back to discovery for the rest',
    async (_label, malformed) => {
      const manager = useManager(sharesEverything)
      useAccountProjects(manager)
      await search([malformed, WEB_ID])
      expect(manager.listOrganizations).toHaveBeenCalledTimes(1)
      expect(queriedProjects(manager)).toEqual([[ACME, WEB_PROJECT_ID]])
    }
  )

  it('searches nothing, rather than everything, when no entry matches a project', async () => {
    const manager = useManager(sharesEverything)
    useAccountProjects(manager)
    await expect(search([ACME, 'Billing'])).resolves.toEqual([])
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
  })

  it('fails when discovery cannot list the account’s projects', async () => {
    const manager = useManager(sharesEverything)
    manager.listOrganizations.mockResolvedValue(new Error('Azure DevOps took too long to respond'))
    const res = await search(['Web'])
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', 'Azure DevOps took too long to respond')
    expect(manager.queryWorkItemIds).not.toHaveBeenCalled()
  })
})
