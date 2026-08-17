import type Atmosphere from '../../Atmosphere'
import {jiraServerIntegrationMeta} from '../../shared/integrations/jiraServerIntegrationMeta'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import {
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class JiraServerClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly description = jiraServerIntegrationMeta.description
  readonly ids = jiraServerIntegrationMeta.ids
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider) return
    JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
  }
}
