import RepoAccess from '../platform/RepoAccess'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import fetchAvailableAzureDevOpsProjects, {
  type AzureDevOpsProject
} from './fetchAvailableAzureDevOpsProjects'
import listGrantedAzureDevOpsProjects from './listGrantedAzureDevOpsProjects'

/** The projects the user's connection shares with this team. A connection limited to chosen projects answers from its own record, without calling Azure DevOps */
const fetchAzureDevOpsProjects = async (
  ctx: RepoFetchCtx
): Promise<AzureDevOpsProject[] | Error> => {
  const {dataLoader, teamId, userId} = ctx
  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'azureDevOps', teamId, userId})
  if (!auth) return []
  const access = RepoAccess.fromMeta(auth.meta)
  if (access.mode === 'all') return fetchAvailableAzureDevOpsProjects(ctx)
  return listGrantedAzureDevOpsProjects(access).map((project) => ({
    ...project,
    service: 'azureDevOps' as const,
    teamId,
    userId
  }))
}

export default fetchAzureDevOpsProjects
