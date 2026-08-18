import type {
  IntegrationAuth,
  IntegrationCtx,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

const resolveAuth = async (ctx: IntegrationCtx): Promise<IntegrationAuth | null> => {
  const {dataLoader, teamId, userId} = ctx
  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'jiraServer', teamId, userId})
  if (!auth?.accessToken) return null
  return {
    accessToken: auth.accessToken,
    accessUserId: auth.userId,
    providerId: auth.providerId,
    raw: auth
  }
}

const jiraServer: ServerIntegrationDefinition = {
  service: 'jiraServer',
  title: 'Jira Data Center',
  authStrategy: 'oauth1',
  resolveAuth,
  capabilities: {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'jiraServer',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    }
  }
}

export default jiraServer
