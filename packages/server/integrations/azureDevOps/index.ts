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
    .load({service: 'azureDevOps', teamId, userId})
  if (!auth?.accessToken) return null
  return {
    accessToken: auth.accessToken,
    accessUserId: auth.userId,
    providerId: auth.providerId,
    raw: auth
  }
}

const azureDevOps: ServerIntegrationDefinition = {
  service: 'azureDevOps',
  title: 'Azure DevOps',
  authStrategy: 'oauth2',
  resolveAuth,
  capabilities: {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'azureDevOps',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    }
  }
}

export default azureDevOps
