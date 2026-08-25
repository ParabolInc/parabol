import {jiraIntegrationMeta} from 'parabol-client/shared/integrations/jiraIntegrationMeta'
import type {JiraSearchQueryJson, TeamMemberIntegrationAuth} from '../../postgres/types'
import {
  type IntegrationCtx,
  type IssueCreateCapability,
  type IssueSearchCapability,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'
import buildJiraSearchQuery from './buildJiraSearchQuery'

export class JiraServerIntegration extends ServerIntegrationDefinition {
  readonly service = jiraIntegrationMeta.service
  readonly title = jiraIntegrationMeta.title
  readonly authStrategy = 'oauth2' as const

  async resolveAuth(ctx: IntegrationCtx): Promise<TeamMemberIntegrationAuth | null> {
    const {dataLoader, teamId, userId} = ctx
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
    return auth?.accessToken ? auth : null
  }

  async isAvailable(ctx: IntegrationCtx) {
    return this.hasSharedProvider(ctx, 'jira')
  }

  async isConnected(ctx: IntegrationCtx) {
    return this.hasActiveAuthRow(ctx, 'jira')
  }

  readonly capabilities: {
    issueCreate: IssueCreateCapability
    issueSearch: IssueSearchCapability<JiraSearchQueryJson>
  } = {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'jira',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    },
    issueSearch: {buildQuery: buildJiraSearchQuery}
  }
}
