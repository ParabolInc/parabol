import type Atmosphere from '../../Atmosphere'
import clickupLogo from '../../styles/theme/images/graphics/clickup.svg'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset
} from '../platform/ClientIntegrationDefinition'
import ClickUpClientManager from './ClickUpClientManager'
import ClickUpIcon from './ClickUpIcon'
import {clickupIntegrationMeta} from './shared/clickupIntegrationMeta'

export class ClickUpClientIntegration extends ClientIntegrationDefinition {
  readonly service = clickupIntegrationMeta.service
  readonly title = clickupIntegrationMeta.title
  readonly description = clickupIntegrationMeta.description
  readonly Icon = ClickUpIcon
  readonly logo: ProviderLogoAsset = {src: clickupLogo}
  readonly capabilities: ClientIntegrationCapabilities = {}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return false
    ClickUpClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId},
      mutationProps
    )
    return true
  }
}
