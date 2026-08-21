import type {DataLoaderWorker} from '../../../graphql/graphql'
import resolveIntegrationProviderForTeam from '../resolveIntegrationProviderForTeam'

const makeDataLoader = (opts: {
  integrationProvider?: unknown
  sharedIntegrationProviders?: unknown[]
}) => {
  const loaders = {
    integrationProviders: {load: jest.fn().mockResolvedValue(opts.integrationProvider)},
    teams: {loadNonNull: jest.fn().mockResolvedValue({id: 'team1', orgId: 'org1'})},
    sharedIntegrationProviders: {
      load: jest.fn().mockResolvedValue(opts.sharedIntegrationProviders ?? [])
    }
  }
  const dataLoader = {
    get: jest.fn((loaderName: keyof typeof loaders) => {
      if (!(loaderName in loaders)) throw new Error(`Unexpected loader ${loaderName}`)
      return loaders[loaderName]
    })
  } as unknown as DataLoaderWorker
  return {dataLoader, loaders}
}

describe('resolveIntegrationProviderForTeam', () => {
  it('resolves an explicit providerId directly', async () => {
    const provider = {id: 42, service: 'jira', scope: 'global'}
    const {dataLoader, loaders} = makeDataLoader({integrationProvider: provider})
    const result = await resolveIntegrationProviderForTeam(dataLoader, {
      providerId: 'integrationProvider:42',
      service: null,
      teamId: 'team1'
    })
    expect(result).toBe(provider)
    expect(loaders.integrationProviders.load).toHaveBeenCalledWith(42)
  })

  it('resolves the global provider from service when providerId is omitted', async () => {
    const teamProvider = {id: 1, service: 'jira', scope: 'team'}
    const globalProvider = {id: 2, service: 'jira', scope: 'global'}
    const {dataLoader} = makeDataLoader({
      sharedIntegrationProviders: [teamProvider, globalProvider]
    })
    const result = await resolveIntegrationProviderForTeam(dataLoader, {
      providerId: null,
      service: 'jira',
      teamId: 'team1'
    })
    expect(result).toBe(globalProvider)
  })

  it('returns null when service-only resolution only finds team-scoped providers', async () => {
    const teamProvider = {id: 1, service: 'jira', scope: 'team'}
    const {dataLoader} = makeDataLoader({sharedIntegrationProviders: [teamProvider]})
    const result = await resolveIntegrationProviderForTeam(dataLoader, {
      providerId: null,
      service: 'jira',
      teamId: 'team1'
    })
    expect(result).toBeNull()
  })

  it('returns null when neither providerId nor service is supplied', async () => {
    const {dataLoader} = makeDataLoader({})
    const result = await resolveIntegrationProviderForTeam(dataLoader, {
      providerId: null,
      service: null,
      teamId: 'team1'
    })
    expect(result).toBeNull()
  })
})
