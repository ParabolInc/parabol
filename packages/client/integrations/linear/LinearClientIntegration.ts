import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import LinearProviderLogo from '../../components/LinearProviderLogo'
import LinearSVG from '../../components/LinearSVG'
import {linearIntegrationMeta} from '../../shared/integrations/linearIntegrationMeta'
import LinearClientManager from '../../utils/LinearClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class LinearClientIntegration extends ClientIntegrationDefinition {
  readonly service = linearIntegrationMeta.service
  readonly title = linearIntegrationMeta.title
  readonly description = linearIntegrationMeta.description
  readonly ids = linearIntegrationMeta.ids
  readonly Icon = LinearSVG
  readonly ProviderLogo = LinearProviderLogo
  readonly iconClassName = 'dark:[&_path]:fill-white'
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaLinearScoping' */ '../../components/ScopePhaseAreaLinearScoping'
          )
      )
    }
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId || !provider.serverBaseUrl) return
    void LinearClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId, serverBaseUrl: provider.serverBaseUrl},
      mutationProps
    )
  }
}
