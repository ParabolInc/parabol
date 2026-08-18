import type {
  IntegrationAuth,
  IntegrationCtx,
  ServerIntegrationDefinition
} from '../platform/ServerIntegrationDefinition'
import TaskIntegrationManagerFactory from '../TaskIntegrationManagerFactory'

const resolveAuth = async (ctx: IntegrationCtx): Promise<IntegrationAuth | null> => {
  const {dataLoader, teamId, userId} = ctx
  const auth = await dataLoader.get('freshGitlabAuth').load({teamId, userId})
  if (!auth?.accessToken) return null
  return {
    accessToken: auth.accessToken,
    accessUserId: auth.userId,
    providerId: auth.providerId,
    raw: auth
  }
}

const gitlab: ServerIntegrationDefinition = {
  service: 'gitlab',
  title: 'GitLab',
  authStrategy: 'oauth2',
  resolveAuth,
  capabilities: {
    issueCreate: {
      initManager: (ctx) =>
        TaskIntegrationManagerFactory.initManager(
          ctx.dataLoader,
          'gitlab',
          {teamId: ctx.teamId, userId: ctx.userId},
          ctx.context,
          ctx.info
        )
    }
  }
}

export default gitlab
