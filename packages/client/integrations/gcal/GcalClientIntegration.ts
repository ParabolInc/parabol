import {lazy} from 'react'
import gCalIntegrationPanelQuery, {
  type GCalIntegrationPanelQuery
} from '../../__generated__/GCalIntegrationPanelQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import {gcalIntegrationMeta} from '../../shared/integrations/gcalIntegrationMeta'
import googleCalendarLogo from '../../styles/theme/images/graphics/google-calendar.svg'
import GcalClientManager from '../../utils/GcalClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset,
  type WorkDrawerCapability
} from '../platform/ClientIntegrationDefinition'
import makeWorkDrawerPanel from '../platform/makeWorkDrawerPanel'
import GcalIcon from './GcalIcon'

const workDrawer: WorkDrawerCapability = {
  Panel: makeWorkDrawerPanel<GCalIntegrationPanelQuery>({
    query: gCalIntegrationPanelQuery,
    Panel: lazy(
      () =>
        import(
          /* webpackChunkName: 'GCalIntegrationPanel' */ '../../components/TeamPrompt/WorkDrawer/GCalIntegrationPanel'
        )
    )
  }),
  connectDescription: 'recent events'
}

export class GcalClientIntegration extends ClientIntegrationDefinition {
  readonly service = gcalIntegrationMeta.service
  readonly title = gcalIntegrationMeta.title
  readonly description = gcalIntegrationMeta.description
  readonly Icon = GcalIcon
  readonly logo: ProviderLogoAsset = {src: googleCalendarLogo}
  readonly capabilities: ClientIntegrationCapabilities = {workDrawer}
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return
    GcalClientManager.openOAuth(atmosphere, provider.id, provider.clientId, teamId, mutationProps)
  }
}
