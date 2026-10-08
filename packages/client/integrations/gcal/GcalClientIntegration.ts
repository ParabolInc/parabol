import type Atmosphere from '../../Atmosphere'
import {gcalIntegrationMeta} from '../../shared/integrations/gcalIntegrationMeta'
import googleCalendarLogo from '../../styles/theme/images/graphics/google-calendar.svg'
import GcalClientManager from '../../utils/GcalClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset
} from '../platform/ClientIntegrationDefinition'
import GcalIcon from './GcalIcon'

export class GcalClientIntegration extends ClientIntegrationDefinition {
  readonly service = gcalIntegrationMeta.service
  readonly title = gcalIntegrationMeta.title
  readonly description = gcalIntegrationMeta.description
  readonly Icon = GcalIcon
  readonly logo: ProviderLogoAsset = {src: googleCalendarLogo}
  readonly capabilities: ClientIntegrationCapabilities = {}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return
    GcalClientManager.openOAuth(atmosphere, provider.id, provider.clientId, teamId, mutationProps)
  }
}
