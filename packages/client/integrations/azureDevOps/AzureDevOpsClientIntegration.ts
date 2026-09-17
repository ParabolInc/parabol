import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import AzureDevOpsSVG from '../../components/AzureDevOpsSVG'
import {azureDevOpsIntegrationMeta} from '../../shared/integrations/azureDevOpsIntegrationMeta'
import azureDevOpsLogo from '../../styles/theme/images/graphics/azure-devops.svg'
import AzureDevOpsClientManager from '../../utils/AzureDevOpsClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset
} from '../platform/ClientIntegrationDefinition'

export class AzureDevOpsClientIntegration extends ClientIntegrationDefinition {
  readonly service = azureDevOpsIntegrationMeta.service
  readonly title = azureDevOpsIntegrationMeta.title
  readonly description = azureDevOpsIntegrationMeta.description
  readonly Icon = AzureDevOpsSVG
  readonly logo: ProviderLogoAsset = {src: azureDevOpsLogo}
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
