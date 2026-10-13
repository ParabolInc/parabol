import graphql from 'babel-plugin-relay/macro'
import type Atmosphere from '../../Atmosphere'
import type {MenuMutationProps} from '../../hooks/useMutationProps'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
import findIntegrationService from '../platform/findIntegrationService'

graphql`
  fragment connectAzureDevOps_service on IntegrationService {
    service
    cloudProvider {
      id
      ... on IntegrationProviderOAuth2 {
        clientId
        tenantId
      }
    }
    sharedProviders {
      id
      ... on IntegrationProviderOAuth2 {
        clientId
        tenantId
      }
    }
  }
`

interface Provider {
  id: string
  clientId?: string
  tenantId?: string | null
}

interface ConnectableService {
  service: string
  cloudProvider: Provider | null | undefined
  sharedProviders: readonly Provider[]
}

/** Opens the Azure DevOps sign-in for the team's own provider if it has one, else the cloud provider. False when neither exists */
const connectAzureDevOps = (
  atmosphere: Atmosphere,
  teamId: string,
  services: readonly ConnectableService[],
  mutationProps: MenuMutationProps
) => {
  const azureDevOps = findIntegrationService(services, 'azureDevOps')
  const provider = azureDevOps?.sharedProviders[0] ?? azureDevOps?.cloudProvider
  if (!provider?.clientId) return false
  const {id, clientId, tenantId} = provider
  void AzureDevOpsClientManager.openOAuth(
    atmosphere,
    teamId,
    {id, clientId, tenantId},
    mutationProps
  )
  return true
}

export default connectAzureDevOps
