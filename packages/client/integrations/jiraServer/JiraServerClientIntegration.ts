import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import JiraServerProviderLogo from '../../components/JiraServerProviderLogo'
import JiraServerSVG from '../../components/JiraServerSVG'
import {jiraServerIntegrationMeta} from '../../shared/integrations/jiraServerIntegrationMeta'
import {ExternalLinks} from '../../types/constEnums'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class JiraServerClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly description = jiraServerIntegrationMeta.description
  readonly ids = jiraServerIntegrationMeta.ids
  readonly Icon = JiraServerSVG
  readonly ProviderLogo = JiraServerProviderLogo
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaJiraServerScoping' */ '../../components/ScopePhaseAreaJiraServerScoping'
          )
      ),
      advertiseWhenUnavailable: true
    }
  }
  readonly contactUs = {
    url: ExternalLinks.INTEGRATIONS_JIRASERVER,
    clickEvent: 'Clicked Jira Server Request Button'
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider) return
    JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
  }
}
