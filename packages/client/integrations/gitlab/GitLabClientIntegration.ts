import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import GitLabProviderLogo from '../../components/GitLabProviderLogo'
import GitLabSVG from '../../components/GitLabSVG'
import {gitlabIntegrationMeta} from '../../shared/integrations/gitlabIntegrationMeta'
import GitLabClientManager from '../../utils/GitLabClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class GitLabClientIntegration extends ClientIntegrationDefinition {
  readonly service = gitlabIntegrationMeta.service
  readonly title = gitlabIntegrationMeta.title
  readonly description = gitlabIntegrationMeta.description
  readonly ids = gitlabIntegrationMeta.ids
  readonly Icon = GitLabSVG
  readonly ProviderLogo = GitLabProviderLogo
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaGitLabScoping' */ '../../components/ScopePhaseAreaGitLabScoping'
          )
      )
    }
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId || !provider.serverBaseUrl) return
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
