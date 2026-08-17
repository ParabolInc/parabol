import type Atmosphere from '../../Atmosphere'
import {githubIntegrationMeta} from '../../shared/integrations/githubIntegrationMeta'
import GitHubClientManager from '../../utils/GitHubClientManager'
import {
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class GitHubClientIntegration extends ClientIntegrationDefinition {
  readonly service = githubIntegrationMeta.service
  readonly title = githubIntegrationMeta.title
  readonly description = githubIntegrationMeta.description
  readonly ids = githubIntegrationMeta.ids
  connect(atmosphere: Atmosphere, {teamId, mutationProps}: ConnectParams) {
    GitHubClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
}
