import {lazy} from 'react'
import AtlassianProviderLogo from '../../AtlassianProviderLogo'
import type Atmosphere from '../../Atmosphere'
import JiraSVG from '../../components/JiraSVG'
import {jiraIntegrationMeta} from '../../shared/integrations/jiraIntegrationMeta'
import {ExternalLinks} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import {hasConfluenceScopes, hasJiraScopes} from '../../utils/atlassianScopes'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class JiraClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly description = jiraIntegrationMeta.description
  readonly ids = jiraIntegrationMeta.ids
  readonly Icon = JiraSVG
  readonly ProviderLogo = AtlassianProviderLogo
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaJiraScoping' */ '../../components/ScopePhaseAreaJiraScoping'
          )
      )
    }
  }
  readonly authorizationHelpUrl = ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_AUTHORIZATION
  getDisconnectSubline(grantedScopes: readonly string[]) {
    const holdsJira = hasJiraScopes(grantedScopes)
    const holdsConfluence = hasConfluenceScopes(grantedScopes)
    if (holdsJira && holdsConfluence) return 'Disconnects Jira and Confluence'
    return holdsConfluence ? 'Disconnects Confluence' : 'Disconnects Jira'
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
