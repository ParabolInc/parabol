import type Atmosphere from '../../Atmosphere'
import {jiraIntegrationMeta} from '../../shared/integrations/jiraIntegrationMeta'
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
  connect(atmosphere: Atmosphere, {teamId, mutationProps}: ConnectParams) {
    AtlassianClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
}
