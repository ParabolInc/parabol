import {jiraServerIntegrationMeta} from 'parabol-client/shared/integrations/jiraServerIntegrationMeta'
import type {JiraSearchQueryJson, TeamMemberIntegrationAuth} from '../../postgres/types'
import parseJiraSearchQuery from '../jira/parseJiraSearchQuery'
import {
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueSearchCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

export class JiraServerServerIntegration extends ServerIntegrationDefinition {
  readonly service = jiraServerIntegrationMeta.service
  readonly title = jiraServerIntegrationMeta.title
  readonly authStrategy = 'oauth1' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})
    return auth?.accessToken ? auth : null
  }

  async isAvailable(ctx: IntegrationCtx) {
    return this.hasSharedProvider(ctx, 'jiraServer')
  }

  async isConnected(ctx: IntegrationCtx) {
    return this.hasActiveAuthRow(ctx, 'jiraServer')
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueSearch: IssueSearchCapability<JiraSearchQueryJson>
  } = {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'jiraServer',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    },
    issueSearch: {parseQuery: parseJiraSearchQuery}
  }
}
