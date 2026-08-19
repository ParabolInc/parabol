import type Atmosphere from '../../Atmosphere'
import AzureDevOpsSVG from '../../components/AzureDevOpsSVG'
import {azureDevOpsIntegrationMeta} from '../../shared/integrations/azureDevOpsIntegrationMeta'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
import {
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class AzureDevOpsClientIntegration extends ClientIntegrationDefinition {
  readonly service = azureDevOpsIntegrationMeta.service
  readonly title = azureDevOpsIntegrationMeta.title
  readonly description = azureDevOpsIntegrationMeta.description
  readonly ids = azureDevOpsIntegrationMeta.ids
  readonly Icon = AzureDevOpsSVG
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider) return
    void AzureDevOpsClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, tenantId: provider.tenantId, clientId: provider.clientId},
      mutationProps
    )
  }
}
