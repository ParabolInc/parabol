import {
  getProviderRowEntries,
  listServiceProviders,
  type ServiceProvider,
  toConnectProviderRef
} from '../integrationServiceProviders'

const cloud: ServiceProvider = {
  id: 'cloud',
  scope: 'global',
  clientId: 'c1',
  serverBaseUrl: 'https://gitlab.com',
  tenantId: null
}
const selfHosted: ServiceProvider = {
  id: 'acme',
  scope: 'team',
  clientId: 'c2',
  serverBaseUrl: 'https://gitlab.acme.com',
  tenantId: null
}

describe('toConnectProviderRef', () => {
  it('fills the OAuth2 fields with null when the provider is not OAuth2', () => {
    expect(toConnectProviderRef({id: 'p9', scope: 'org'})).toEqual({
      id: 'p9',
      scope: 'org',
      clientId: null,
      serverBaseUrl: null,
      tenantId: null
    })
  })
})

describe('listServiceProviders', () => {
  it('lists shared providers first, then the cloud provider', () => {
    const providers = listServiceProviders({cloudProvider: cloud, sharedProviders: [selfHosted]})
    expect(providers.map(({id}) => id)).toEqual(['acme', 'cloud'])
  })

  it('is empty without any provider', () => {
    expect(listServiceProviders({cloudProvider: null, sharedProviders: []})).toEqual([])
  })
})

describe('getProviderRowEntries', () => {
  const base = {title: 'GitLab', description: 'Use GitLab Issues from within Parabol.'}

  it('a single provider is labelled with the service title and description', () => {
    const entries = getProviderRowEntries({
      ...base,
      isConnected: false,
      auth: null,
      providers: [selfHosted]
    })
    expect(entries).toEqual([{provider: selfHosted, name: 'GitLab', description: base.description}])
  })

  it('multiple providers are labelled per provider', () => {
    const entries = getProviderRowEntries({
      ...base,
      isConnected: false,
      auth: null,
      providers: [selfHosted, cloud]
    })
    expect(entries.map(({name, description}) => [name, description])).toEqual([
      ['gitlab.acme.com', 'Connect to your own GitLab server.'],
      ['GitLab', base.description]
    ])
  })

  it('when connected only the connected provider is listed', () => {
    const entries = getProviderRowEntries({
      ...base,
      isConnected: true,
      auth: {providerId: 'acme'},
      providers: [selfHosted, cloud]
    })
    expect(entries.map(({provider}) => provider.id)).toEqual(['acme'])
    expect(entries[0]!.name).toBe('gitlab.acme.com')
  })

  it('falls back to the first provider when the connected one is not listed', () => {
    const entries = getProviderRowEntries({
      ...base,
      isConnected: true,
      auth: {providerId: 'gone'},
      providers: [cloud]
    })
    expect(entries.map(({provider}) => provider.id)).toEqual(['cloud'])
  })

  it('is empty without providers', () => {
    expect(getProviderRowEntries({...base, isConnected: false, auth: null, providers: []})).toEqual(
      []
    )
  })

  it('labels an org-scoped shared provider with its stripped host', () => {
    const orgProvider: ServiceProvider = {
      id: 'org-provider',
      scope: 'org',
      clientId: 'c3',
      serverBaseUrl: 'http://gitlab.internal',
      tenantId: null
    }
    const entries = getProviderRowEntries({
      ...base,
      isConnected: false,
      auth: null,
      providers: [orgProvider, cloud]
    })
    expect(entries.map(({name, description}) => [name, description])).toEqual([
      ['gitlab.internal', 'Connect to your own GitLab server.'],
      ['GitLab', base.description]
    ])
  })

  it('falls back to the service title when a shared provider has no serverBaseUrl', () => {
    const providerWithoutBaseUrl: ServiceProvider = {
      id: 'no-base-url',
      scope: 'team',
      clientId: 'c4',
      serverBaseUrl: null,
      tenantId: null
    }
    const entries = getProviderRowEntries({
      ...base,
      isConnected: false,
      auth: null,
      providers: [providerWithoutBaseUrl, cloud]
    })
    expect(entries.map(({name, description}) => [name, description])).toEqual([
      ['GitLab', 'Connect to your own GitLab server.'],
      ['GitLab', base.description]
    ])
  })
})
