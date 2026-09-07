import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import AzureDevOpsProviderLogo from '../../components/AzureDevOpsProviderLogo'
import AzureDevOpsSVG from '../../components/AzureDevOpsSVG'
import {azureDevOpsIntegrationMeta} from '../../shared/integrations/azureDevOpsIntegrationMeta'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class AzureDevOpsClientIntegration extends ClientIntegrationDefinition {
  readonly service = azureDevOpsIntegrationMeta.service
  readonly title = azureDevOpsIntegrationMeta.title
  readonly description = azureDevOpsIntegrationMeta.description
  readonly ids = azureDevOpsIntegrationMeta.ids
  readonly Icon = AzureDevOpsSVG
  readonly ProviderLogo = AzureDevOpsProviderLogo
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaAzureDevOpsScoping' */ '../../components/ScopePhaseAreaAzureDevOpsScoping'
          )
      )
    }
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return
    void AzureDevOpsClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, tenantId: provider.tenantId, clientId: provider.clientId},
      mutationProps
    )
  }
}
