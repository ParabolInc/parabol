import type Atmosphere from '../../Atmosphere'
import JiraSVG from '../../components/JiraSVG'
import {jiraIntegrationMeta} from '../../shared/integrations/jiraIntegrationMeta'
import {ExternalLinks} from '../../types/constEnums'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import {
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class JiraClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly description = jiraIntegrationMeta.description
  readonly ids = jiraIntegrationMeta.ids
  readonly Icon = JiraSVG
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
