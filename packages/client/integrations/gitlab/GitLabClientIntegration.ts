import type Atmosphere from '../../Atmosphere'
import {gitlabIntegrationMeta} from '../../shared/integrations/gitlabIntegrationMeta'
import GitLabClientManager from '../../utils/GitLabClientManager'
import {
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class GitLabClientIntegration extends ClientIntegrationDefinition {
  readonly service = gitlabIntegrationMeta.service
  readonly title = gitlabIntegrationMeta.title
  readonly description = gitlabIntegrationMeta.description
  readonly ids = gitlabIntegrationMeta.ids
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider) return
    GitLabClientManager.openOAuth(
      atmosphere,
      provider.id,
      provider.clientId,
      provider.serverBaseUrl,
      teamId,
      mutationProps
    )
  }
}
