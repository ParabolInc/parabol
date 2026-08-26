import type Atmosphere from '../../Atmosphere'
import JiraSVG from '../../components/JiraSVG'
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
  readonly Icon = JiraSVG
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider) return
    AtlassianClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
  }
}
