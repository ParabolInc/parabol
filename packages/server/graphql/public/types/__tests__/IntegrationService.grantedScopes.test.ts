import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import IntegrationService, {type IntegrationServiceSource} from '../IntegrationService'

jest.mock('../../../../integrations/platform/registry', () => ({getServerIntegration: () => ({})}))
jest.mock('../../../../integrations/loadServiceRepoIntegrations', () => ({
  __esModule: true,
  default: jest.fn()
}))

const load = jest.fn()
const buildContext = () => ({dataLoader: {get: () => ({load})}}) as unknown as GQLContext
const source: IntegrationServiceSource = {
  service: 'jira',
  title: 'Jira',
  capabilities: [],
  teamId: 'team1',
  userId: 'user1'
}
const info = {} as GraphQLResolveInfo
const resolve = IntegrationService.grantedScopes
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

describe('IntegrationService.grantedScopes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('splits the stored scope string on spaces or commas', async () => {
    load.mockResolvedValue({isActive: true, scopes: 'read:jira-work offline_access'})
    await expect(resolve(source, {}, buildContext(), info)).resolves.toEqual([
      'read:jira-work',
      'offline_access'
    ])
    load.mockResolvedValue({isActive: true, scopes: 'read:org,repo'})
    await expect(resolve(source, {}, buildContext(), info)).resolves.toEqual(['read:org', 'repo'])
    expect(load).toHaveBeenCalledWith({service: 'jira', teamId: 'team1', userId: 'user1'})
  })

  it('is empty without a grant or scopes', async () => {
    load.mockResolvedValue(null)
    await expect(resolve(source, {}, buildContext(), info)).resolves.toEqual([])
    load.mockResolvedValue({isActive: true, scopes: null})
    await expect(resolve(source, {}, buildContext(), info)).resolves.toEqual([])
  })
})
