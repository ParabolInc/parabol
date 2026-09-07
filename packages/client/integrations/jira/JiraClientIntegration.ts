import {lazy} from 'react'
import AtlassianProviderLogo from '../../AtlassianProviderLogo'
import type Atmosphere from '../../Atmosphere'
import JiraSVG from '../../components/JiraSVG'
import JiraProjectId from '../../shared/gqlIds/JiraProjectId'
import {jiraIntegrationMeta} from '../../shared/integrations/jiraIntegrationMeta'
import {ExternalLinks} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import {describeAtlassianDisconnect} from '../../utils/atlassianScopes'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class JiraClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly description = jiraIntegrationMeta.description
  readonly Icon = JiraSVG
  readonly ProviderLogo = AtlassianProviderLogo
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaJiraScoping' */ '../../components/ScopePhaseAreaJiraScoping'
          )
      ),
      projectFilterLabel: (filter) => JiraProjectId.split(filter).projectKey
    }
  }
  readonly authorizationHelpUrl = ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_AUTHORIZATION
  getDisconnectSubline(grantedScopes: readonly string[]) {
    return describeAtlassianDisconnect(grantedScopes)
  }
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
