import type {
  IntegrationProviderScopeEnum,
  IntegrationServiceProviderRow_service$data
} from '../../__generated__/IntegrationServiceProviderRow_service.graphql'
import type {ConnectProviderRef} from './ClientIntegrationDefinition'

export interface ServiceProvider extends ConnectProviderRef {
  scope: IntegrationProviderScopeEnum
}

/** A provider as a Relay fragment on the IntegrationProvider interface returns it; OAuth2 fields are absent on other strategies */
export type RawServiceProvider = NonNullable<
  IntegrationServiceProviderRow_service$data['cloudProvider']
>

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

const hostOf = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return undefined
  }
}

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
      name: (provider.serverBaseUrl && hostOf(provider.serverBaseUrl)) || title,
      description: `Connect to your own ${title} server.`
    }
  })
}
