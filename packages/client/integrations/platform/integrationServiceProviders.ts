import type {ConnectProviderRef} from './ClientIntegrationDefinition'

export type ProviderScope = 'global' | 'org' | 'team'

export interface ServiceProvider extends ConnectProviderRef {
  scope: ProviderScope
}

/** A provider as a Relay fragment on the IntegrationProvider interface returns it; OAuth2 fields are absent on other strategies */
export interface RawServiceProvider {
  id: string
  scope: ProviderScope
  clientId?: string | null
  serverBaseUrl?: string | null
  tenantId?: string | null
}

export const toConnectProviderRef = (provider: RawServiceProvider): ServiceProvider => ({
  id: provider.id,
  scope: provider.scope,
  clientId: provider.clientId ?? null,
  serverBaseUrl: provider.serverBaseUrl ?? null,
  tenantId: provider.tenantId ?? null
})

/** Shared (team/org) providers first: connect flows prefer them over the cloud row */
export const listServiceProviders = (service: {
  cloudProvider: RawServiceProvider | null | undefined
  sharedProviders: readonly RawServiceProvider[]
}): ServiceProvider[] => {
  const {cloudProvider, sharedProviders} = service
  const providers = sharedProviders.map(toConnectProviderRef)
  if (cloudProvider) providers.push(toConnectProviderRef(cloudProvider))
  return providers
}

export interface ProviderRowEntryModel {
  provider: ServiceProvider
  name: string
  description: string
}

const hostOf = (url: string) => new URL(url).host

export const getProviderRowEntries = (input: {
  title: string
  description: string
  isConnected: boolean
  auth: {providerId: string} | null | undefined
  providers: readonly ServiceProvider[]
}): ProviderRowEntryModel[] => {
  const {title, description, isConnected, auth, providers} = input
  if (providers.length === 0) return []
  const connectedProvider = providers.find(({id}) => id === auth?.providerId) ?? providers[0]!
  const visibleProviders = isConnected ? [connectedProvider] : providers
  const labelPerProvider = providers.length > 1
  return visibleProviders.map((provider) => {
    const isCloud = provider.scope === 'global'
    if (!labelPerProvider || isCloud) return {provider, name: title, description}
    return {
      provider,
      name: provider.serverBaseUrl ? hostOf(provider.serverBaseUrl) : title,
      description: `Connect to your own ${title} server.`
    }
  })
}
