import RepoAccess from '../../../integrations/platform/RepoAccess'
import {getServerIntegration} from '../../../integrations/platform/registry'
import logError from '../../../utils/logError'
import type {AzureDevOpsIntegrationServiceResolvers} from '../resolverTypes'

const AzureDevOpsIntegrationService: AzureDevOpsIntegrationServiceResolvers = {
  repoAccess: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'azureDevOps', teamId, userId})
    return RepoAccess.fromMeta(auth?.meta).mode
  },
  availableRepos: async ({teamId, userId}, _args, context, info) => {
    const {repoAccess} = getServerIntegration('azureDevOps').capabilities
    const {dataLoader} = context
    const repos = await repoAccess.fetchAvailableRepos({dataLoader, teamId, userId, context, info})
    if (repos instanceof Error) {
      logError(repos, {userId, tags: {teamId, service: 'azureDevOps'}})
      return null
    }
    return repos
  }
}

export default AzureDevOpsIntegrationService
