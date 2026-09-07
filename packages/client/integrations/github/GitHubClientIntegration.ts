import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import GitHubProviderLogo from '../../components/GitHubProviderLogo'
import GitHubSVG from '../../components/GitHubSVG'
import {githubIntegrationMeta} from '../../shared/integrations/githubIntegrationMeta'
import GitHubClientManager from '../../utils/GitHubClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class GitHubClientIntegration extends ClientIntegrationDefinition {
  readonly service = githubIntegrationMeta.service
  readonly title = githubIntegrationMeta.title
  readonly description = githubIntegrationMeta.description
  readonly ids = githubIntegrationMeta.ids
  readonly Icon = GitHubSVG
  readonly ProviderLogo = GitHubProviderLogo
  readonly iconClassName = 'dark:[&_path]:fill-white'
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaGitHubScoping' */ '../../components/ScopePhaseAreaGitHubScoping'
          )
      )
    }
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider?.clientId) return
    GitHubClientManager.openOAuth(
      atmosphere,
      teamId,
      {id: provider.id, clientId: provider.clientId},
      mutationProps
    )
  }
}
