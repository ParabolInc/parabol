import buildAzureDevOpsWorkWiql from 'parabol-client/shared/integrations/buildAzureDevOpsWorkWiql'
import getAzureDevOpsManager from '../../../../../integrations/azureDevOps/getAzureDevOpsManager'
import type {AzureDevOpsWorkItem} from '../../../../../integrations/azureDevOps/mapAzureDevOpsWorkItem'
import searchAzureDevOpsWorkItems from '../../../../../integrations/azureDevOps/searchAzureDevOpsWorkItems'
import type {DataLoaderWorker} from '../../../../graphql'
import fetchAzureDevOpsIssues from '../fetchAzureDevOpsIssues'

jest.mock('../../../../../integrations/azureDevOps/getAzureDevOpsManager', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../../../integrations/azureDevOps/searchAzureDevOpsWorkItems', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../../../utils/Logger', () => ({
  Logger: {log: jest.fn(), error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn()}
}))

const mockedGetManager = jest.mocked(getAzureDevOpsManager)
const mockedSearch = jest.mocked(searchAzureDevOpsWorkItems)

const ACME = 'dev.azure.com/acme'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const START_AT = '2026-10-01T00:00:00.000Z'
const END_AT = '2026-10-07T23:59:59.999Z'

const dataLoader = {} as DataLoaderWorker
const listComments = jest.fn()

const searchQuery = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    startAt: START_AT,
    endAt: END_AT,
    kinds: ['assigned', 'created'],
    projectIds: [],
    ...overrides
  })

const workItem = (
  id: string,
  overrides: Partial<AzureDevOpsWorkItem> = {}
): AzureDevOpsWorkItem => ({
  service: 'azureDevOps',
  id,
  instanceId: ACME,
  teamProject: WEB_PROJECT_ID,
  projectName: 'Web',
  title: `Work item ${id}`,
  url: `https://dev.azure.com/acme/Web/_workitems/edit/${id}`,
  state: 'Active',
  type: 'User Story',
  descriptionHTML: '',
  updatedAt: new Date('2026-10-02T00:00:00.000Z'),
  fields: {},
  teamId: 'team1',
  userId: 'user1',
  ...overrides
})

const run = (query: string) => fetchAzureDevOpsIssues('team1', 'user1', query, dataLoader)

describe('fetchAzureDevOpsIssues', () => {
  beforeEach(() => {
    mockedGetManager.mockResolvedValue({listComments} as unknown as Awaited<
      ReturnType<typeof getAzureDevOpsManager>
    >)
    mockedSearch.mockResolvedValue([])
    listComments.mockResolvedValue([])
  })

  it.each([
    ['is not JSON', '{startAt'],
    ['is JSON null', 'null'],
    ['has an unreadable start date', searchQuery({startAt: 'last tuesday'})],
    ['has an unreadable end date', searchQuery({endAt: 'soon'})],
    ['has an empty start date', searchQuery({startAt: ''})],
    ['has a null end date', searchQuery({endAt: null})],
    ['has a start date that is not a string', searchQuery({startAt: 1790812800000})],
    ['asks for no kind of work', searchQuery({kinds: []})],
    ['asks only for kinds it does not know', searchQuery({kinds: ['reviewed']})],
    ['sends kinds that are not a list', searchQuery({kinds: 'assigned'})]
  ])('returns nothing, without searching, when the query %s', async (_label, query) => {
    await expect(run(query)).resolves.toEqual([])
    expect(mockedSearch).not.toHaveBeenCalled()
    expect(mockedGetManager).not.toHaveBeenCalled()
  })

  it('searches the date window for the known kinds, passing projectIds as projects', async () => {
    const projectId = `${ACME}:${WEB_PROJECT_ID}`
    await run(
      searchQuery({kinds: ['created', 'reviewed'], projectIds: [projectId, 'Api', 7, null]})
    )
    expect(mockedSearch).toHaveBeenCalledWith(
      {dataLoader, teamId: 'team1', userId: 'user1'},
      {
        where: buildAzureDevOpsWorkWiql({kinds: ['created'], startAt: START_AT, endAt: END_AT}),
        projects: [projectId, 'Api'],
        limit: 20
      }
    )
  })

  it('searches every shared project when projectIds is missing', async () => {
    await run(searchQuery({projectIds: undefined}))
    expect(mockedSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({projects: []})
    )
  })

  it.each([
    ['no start date', {startAt: undefined}, {endAt: END_AT}],
    ['no end date', {endAt: undefined}, {startAt: START_AT}],
    ['neither date', {startAt: undefined, endAt: undefined}, {}]
  ])('searches an open-ended window when the query has %s', async (_label, omitted, bounds) => {
    await run(searchQuery(omitted))
    expect(mockedSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        where: buildAzureDevOpsWorkWiql({kinds: ['assigned', 'created'], ...bounds})
      })
    )
  })

  it('normalises the dates to ISO strings before building the clause', async () => {
    await run(searchQuery({startAt: '2026-10-01', endAt: '2026-10-07T18:00:00-06:00'}))
    expect(mockedSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        where: buildAzureDevOpsWorkWiql({
          kinds: ['assigned', 'created'],
          startAt: '2026-10-01T00:00:00.000Z',
          endAt: '2026-10-08T00:00:00.000Z'
        })
      })
    )
  })

  it('describes each work item with its HTML stripped', async () => {
    const updatedAt = new Date('2026-10-03T12:00:00.000Z')
    mockedSearch.mockResolvedValue([
      workItem('42', {
        title: 'Fix the login page',
        type: 'Bug',
        state: 'Resolved',
        updatedAt,
        descriptionHTML: '<div>Users <b>cannot</b> sign in</div>'
      })
    ])
    await expect(run(searchQuery())).resolves.toEqual([
      {
        kind: 'Bug',
        title: 'Fix the login page',
        reference: '#42',
        subtitle: 'Web',
        status: 'Resolved',
        url: 'https://dev.azure.com/acme/Web/_workitems/edit/42',
        updatedAt,
        description: 'Users cannot sign in',
        comments: []
      }
    ])
  })

  it('attaches the latest comments oldest-first, as text', async () => {
    mockedSearch.mockResolvedValue([workItem('42')])
    listComments.mockResolvedValue([
      {text: '<div>Deployed the <i>fix</i></div>', createdBy: {displayName: 'Grace Hopper'}},
      {text: '<div>Reproduced it</div>'},
      {text: '<div>Seeing this in production</div>', createdBy: {displayName: 'Ada Lovelace'}}
    ])
    const [issue] = await run(searchQuery())
    expect(issue!.comments).toEqual([
      {author: 'Ada Lovelace', body: 'Seeing this in production'},
      {author: 'unknown', body: 'Reproduced it'},
      {author: 'Grace Hopper', body: 'Deployed the fix'}
    ])
    expect(listComments).toHaveBeenCalledWith(ACME, WEB_PROJECT_ID, '42', 10)
  })

  it('keeps a work item whose comments cannot be read, without comments', async () => {
    mockedSearch.mockResolvedValue([workItem('42'), workItem('43')])
    listComments.mockImplementation(async (_instanceId, _projectId, workItemId) =>
      workItemId === '42'
        ? new Error('Azure DevOps took too long to respond')
        : [{text: '<div>Looks good</div>', createdBy: {displayName: 'Ada Lovelace'}}]
    )
    const issues = await run(searchQuery())
    expect(issues.map(({reference, comments}) => ({reference, comments}))).toEqual([
      {reference: '#42', comments: []},
      {reference: '#43', comments: [{author: 'Ada Lovelace', body: 'Looks good'}]}
    ])
  })

  it('returns nothing when the search fails', async () => {
    mockedSearch.mockResolvedValue(new Error('No Azure DevOps projects are shared with this team'))
    await expect(run(searchQuery())).resolves.toEqual([])
    expect(listComments).not.toHaveBeenCalled()
  })

  it('returns nothing when Azure DevOps is not connected', async () => {
    mockedGetManager.mockResolvedValue(null)
    mockedSearch.mockResolvedValue([workItem('42')])
    await expect(run(searchQuery())).resolves.toEqual([])
  })
})
