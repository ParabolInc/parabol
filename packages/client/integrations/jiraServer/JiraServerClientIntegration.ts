import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import JiraServerSVG from '../../components/JiraServerSVG'
import IntegrationRepoId from '../../shared/gqlIds/IntegrationRepoId'
import {jiraServerIntegrationMeta} from '../../shared/integrations/jiraServerIntegrationMeta'
import jiraServerLogo from '../../styles/theme/images/graphics/jira-software-blue.svg'
import {ExternalLinks} from '../../types/constEnums'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset
} from '../platform/ClientIntegrationDefinition'

export class JiraServerClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly description = jiraServerIntegrationMeta.description
  readonly Icon = JiraServerSVG
  readonly logo: ProviderLogoAsset = {src: jiraServerLogo}
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaJiraServerScoping' */ '../../components/ScopePhaseAreaJiraServerScoping'
          )
      ),
      projectFilterLabel: (filter) => IntegrationRepoId.split(filter).projectKey ?? filter
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
