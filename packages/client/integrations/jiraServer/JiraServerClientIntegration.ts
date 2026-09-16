import {lazy} from 'react'
import type Atmosphere from '../../Atmosphere'
import JiraServerSVG from '../../components/JiraServerSVG'
import IntegrationRepoId from '../../shared/gqlIds/IntegrationRepoId'
import {jiraServerIntegrationMeta} from '../../shared/integrations/jiraServerIntegrationMeta'
import JiraServerClientManager from '../../utils/JiraServerClientManager'
import {
  type ClientIntegrationCapabilities,
  ClientIntegrationDefinition,
  type ConnectParams
} from '../platform/ClientIntegrationDefinition'

export class JiraServerClientIntegration extends ClientIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly description = jiraServerIntegrationMeta.description
  readonly Icon = JiraServerSVG
  readonly capabilities: ClientIntegrationCapabilities = {
    scoping: {
      Panel: lazy(
        () =>
          import(
            /* webpackChunkName: 'ScopePhaseAreaJiraServerScoping' */ '../../components/ScopePhaseAreaJiraServerScoping'
          )
      ),
      advertiseWhenUnavailable: true,
      projectFilterLabel: (filter) => IntegrationRepoId.split(filter).projectKey ?? filter
    }
  }
  connect(atmosphere: Atmosphere, {teamId, mutationProps, provider}: ConnectParams) {
    if (!provider) return
    JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
  }
}
