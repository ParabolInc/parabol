import type {AzureAccountProject} from '../../dataloader/azureDevOpsLoaders'
import type {IntegrationProviderAzureDevOps} from '../../postgres/types/IntegrationProvider'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import {getInstanceId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'

/** Every Azure DevOps project across the user's organizations; an Error when the remote failed */
const fetchAzureDevOpsProjects = async ({
  dataLoader,
  teamId,
  userId
}: RepoFetchCtx): Promise<AzureAccountProject[] | Error> => {
  const auth = await dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId})
  if (!auth) return []
  const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
  const manager = new AzureDevOpsServerManager(auth, provider as IntegrationProviderAzureDevOps)
  const {error, projects} = await manager.getAllUserProjects()
  if (error !== undefined) return error
  return (projects ?? []).map((project) => ({
    ...project,
    instanceId: getInstanceId(project.url),
    userId,
    projectId: project.id,
    teamId,
    service: 'azureDevOps' as const
  }))
}

export default fetchAzureDevOpsProjects
