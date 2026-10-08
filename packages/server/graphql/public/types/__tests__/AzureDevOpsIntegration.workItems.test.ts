import type {GraphQLResolveInfo} from 'graphql'
import type {AzureDevOpsWorkItem} from '../../../../integrations/azureDevOps/mapAzureDevOpsWorkItem'
import searchAzureDevOpsWorkItems from '../../../../integrations/azureDevOps/searchAzureDevOpsWorkItems'
import type {GQLContext} from '../../../graphql'
import AzureDevOpsIntegration from '../AzureDevOpsIntegration'

jest.mock('../../../../integrations/azureDevOps/searchAzureDevOpsWorkItems', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockedSearch = jest.mocked(searchAzureDevOpsWorkItems)

const dataLoader = {}
const context = {dataLoader} as unknown as GQLContext
const info = {} as GraphQLResolveInfo
const source = {teamId: 'team1', userId: 'user1'}

const resolve = AzureDevOpsIntegration.workItems
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (args: {
  queryString: string | null
  isWIQL: boolean
  first?: number
  projectKeyFilters?: string[]
}) => resolve(source, {first: 100, projectKeyFilters: [], ...args}, context, info)

const workItem: AzureDevOpsWorkItem = {
  service: 'azureDevOps',
  id: '42',
  instanceId: 'dev.azure.com/acme',
  teamProject: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  projectName: 'Web',
  title: 'Fix the login page',
  url: 'https://dev.azure.com/acme/Web/_workitems/edit/42',
  state: 'Active',
  type: 'User Story',
  descriptionHTML: '',
  updatedAt: new Date('2026-10-02T00:00:00.000Z'),
  fields: {},
  teamId: 'team1',
  userId: 'user1'
}

describe('AzureDevOpsIntegration.workItems', () => {
  beforeEach(() => {
    mockedSearch.mockResolvedValue([workItem])
  })

  it('answers unbalanced WIQL with an empty connection carrying the error, without searching', async () => {
    const connection = await run({queryString: '1 = 1) OR ([System.Id] > 0', isWIQL: true})
    expect(connection).toMatchObject({
      error: {message: 'That WIQL has unbalanced parentheses, brackets or quotes'},
      edges: [],
      pageInfo: {hasNextPage: false}
    })
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('searches the filtered projects with the clause and ordering split from the WIQL', async () => {
    const projectKeyFilters = ['Web', 'dev.azure.com/acme:b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e']
    const connection = await run({
      queryString: "[System.State] = 'Active' ORDER BY [System.Id]",
      isWIQL: true,
      projectKeyFilters,
      first: 10
    })
    expect(mockedSearch).toHaveBeenCalledWith(
      {dataLoader, teamId: 'team1', userId: 'user1'},
      {
        where: "[System.State] = 'Active'",
        orderBy: 'ORDER BY [System.Id]',
        projects: projectKeyFilters,
        limit: 10
      }
    )
    expect(connection).toMatchObject({
      error: undefined,
      edges: [{cursor: workItem.updatedAt, node: workItem}]
    })
  })

  it.each([
    [500, 100],
    [0, 1],
    [-3, 1],
    [25, 25]
  ])('asks for first: %i as a limit of %i', async (first, limit) => {
    await run({queryString: null, isWIQL: false, first})
    expect(mockedSearch).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({limit}))
  })

  it('carries a failed search as the error of an empty connection', async () => {
    mockedSearch.mockResolvedValue(new Error('Azure DevOps took too long to respond'))
    await expect(run({queryString: 'login', isWIQL: false})).resolves.toMatchObject({
      error: {message: 'Azure DevOps took too long to respond'},
      edges: []
    })
  })
})
