import type {ConnectProvider} from './ClientIntegrationDefinition'

interface CloudProviderService {
  service: string
  cloudProvider:
    | {
        id: string
        clientId?: string
        serverBaseUrl?: string
        tenantId?: string | null
      }
    | null
    | undefined
}

const findIntegrationService = <T extends {service: string}>(
  services: readonly T[],
  service: T['service']
) => services.find((integrationService) => integrationService.service === service)

export const getConnectProvider = (
  services: readonly CloudProviderService[],
  service: string
): ConnectProvider | null => {
  const cloudProvider = findIntegrationService(services, service)?.cloudProvider
  if (!cloudProvider?.clientId || !cloudProvider.serverBaseUrl) return null
  const {id, clientId, serverBaseUrl, tenantId} = cloudProvider
  return {id, clientId, serverBaseUrl, tenantId: tenantId ?? null}
}

export const isServiceAvailable = (
  services: readonly {service: string; isAvailable: boolean}[],
  service: string
) => findIntegrationService(services, service)?.isAvailable ?? false

export default findIntegrationService
