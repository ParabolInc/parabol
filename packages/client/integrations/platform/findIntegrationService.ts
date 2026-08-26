import graphql from 'babel-plugin-relay/macro'
import type {ConnectProvider} from './ClientIntegrationDefinition'

graphql`
  fragment findIntegrationService_cloudProvider on IntegrationService {
    service
    cloudProvider {
      id
      ... on IntegrationProviderOAuth2 {
        clientId
        serverBaseUrl
        tenantId
      }
    }
  }
`

graphql`
  fragment findIntegrationService_auth on IntegrationService {
    service
    auth {
      providerId
    }
  }
`

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

export default findIntegrationService
