import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import IntegrationService, {type IntegrationServiceSource} from '../IntegrationService'

const capabilities: {issueSearch?: {persistQueries?: boolean}} = {}
const getAuthRow = jest.fn()

jest.mock('../../../../integrations/platform/registry', () => ({
  getServerIntegration: () => ({capabilities, getAuthRow})
}))
jest.mock('../../../../integrations/loadServiceRepoIntegrations', () => ({
  __esModule: true,
  default: jest.fn()
}))

const load = jest.fn()

const buildContext = () =>
  ({
    dataLoader: {get: () => ({load})}
  }) as unknown as GQLContext

const source: IntegrationServiceSource = {
  service: 'jira',
  title: 'Jira',
  capabilities: [],
  teamId: 'team1',
  userId: 'user1'
}

const resolve = IntegrationService.searchQueries
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = () => resolve(source, {}, buildContext(), {} as GraphQLResolveInfo)

describe('IntegrationService.searchQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete capabilities.issueSearch
  })

  it('returns [] without loading when the service does not persist queries', async () => {
    capabilities.issueSearch = {}
    await expect(run()).resolves.toEqual([])
    expect(getAuthRow).not.toHaveBeenCalled()
    expect(load).not.toHaveBeenCalled()
  })

  it('returns [] when the viewer has no auth row', async () => {
    capabilities.issueSearch = {persistQueries: true}
    getAuthRow.mockResolvedValue(null)
    await expect(run()).resolves.toEqual([])
    expect(load).not.toHaveBeenCalled()
  })

  it('loads the recent queries for the service and returns the rows as-is', async () => {
    capabilities.issueSearch = {persistQueries: true}
    getAuthRow.mockResolvedValue({providerId: 7})
    const rows = [{id: 1, service: 'jira', query: {queryString: 'flow'}}]
    load.mockResolvedValue(rows)
    await expect(run()).resolves.toBe(rows)
    expect(load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      service: 'jira',
      providerId: 7
    })
  })
})
