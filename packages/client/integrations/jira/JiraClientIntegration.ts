import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import JiraSVG from '../../components/JiraSVG'
import JiraProjectId from '../../shared/gqlIds/JiraProjectId'
import {jiraIntegrationMeta} from '../../shared/integrations/jiraIntegrationMeta'
import atlassianLogo from '../../styles/theme/images/graphics/atlassian-gradient.svg'
import {ExternalLinks} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import {describeAtlassianDisconnect} from '../../utils/atlassianScopes'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams,
  type ProviderLogoAsset
} from '../platform/ClientIntegrationDefinition'

export class JiraClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly description = jiraIntegrationMeta.description
  readonly Icon = JiraSVG
  readonly logo: ProviderLogoAsset = {src: atlassianLogo}
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaJiraScoping' */ '../../components/ScopePhaseAreaJiraScoping'
          )
      ),
      projectFilterLabel: (filter) => JiraProjectId.split(filter).projectKey
    },
    settings: {
      getDisconnectSubline: describeAtlassianDisconnect
    }
  }
  readonly authorizationHelpUrl = ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_AUTHORIZATION
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider, heldScopes}: ConnectParams) {
    if (!provider?.clientId) return
    AtlassianClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId},
      mutationProps,
      AtlassianClientManager.JIRA_SCOPE,
      heldScopes
    )
  }
}
