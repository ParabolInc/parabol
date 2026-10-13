import RepoAccess from '../../../integrations/platform/RepoAccess'
import refreshRepoAccessNames from '../../../integrations/platform/refreshRepoAccessNames'
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
    const definition = getServerIntegration('azureDevOps')
    const {repoAccess, repoList} = definition.capabilities
    const {dataLoader} = context
    const ctx = {dataLoader, teamId, userId, context, info}
    const [repos, auth] = await Promise.all([
      repoAccess.fetchAvailableRepos(ctx),
      definition.getAuthRow(ctx)
    ])
    if (repos instanceof Error) {
      logError(repos, {userId, tags: {teamId, service: 'azureDevOps'}})
      return null
    }
    if (auth) {
      const listedRepos = repos.map((repo) => ({
        id: repoList.integrationRepoId(repo),
        name: repoList.name(repo)
      }))
      await refreshRepoAccessNames(auth, listedRepos, dataLoader).catch((e: unknown) => {
        const error = e instanceof Error ? e : new Error(String(e))
        logError(error, {userId, tags: {teamId, service: 'azureDevOps'}})
      })
    }
    return repos
  }
}

export default AzureDevOpsIntegrationService
