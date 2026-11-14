import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import IntegrationService, {type IntegrationServiceSource} from '../IntegrationService'

const getSharedProviders = jest.fn()
jest.mock('../../../../integrations/platform/registry', () => ({
  getServerIntegration: () => ({getSharedProviders})
}))
jest.mock('../../../../integrations/loadServiceRepoIntegrations', () => ({
  __esModule: true,
  default: jest.fn()
}))

const dataLoader = {}
const context = {dataLoader} as unknown as GQLContext
const source: IntegrationServiceSource = {
  service: 'azureDevOps',
  title: 'Azure DevOps',
  capabilities: [],
  teamId: 'team1',
  userId: 'user1'
}
const info = {} as GraphQLResolveInfo
const resolve = IntegrationService.sharedProviders
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

describe('IntegrationService.sharedProviders', () => {
  beforeEach(() => jest.clearAllMocks())

  it('delegates to the service definition with the viewer team context', async () => {
    const providers = [{id: 'p1', scope: 'team'}]
    getSharedProviders.mockResolvedValue(providers)
    await expect(resolve(source, {}, context, info)).resolves.toBe(providers)
    expect(getSharedProviders).toHaveBeenCalledWith({dataLoader, teamId: 'team1', userId: 'user1'})
  })
})
