import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'

const resolveAzureDevOpsDimensionFieldKey = async ({
  task,
  dataLoader,
  teamId,
  viewerId
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration, id: taskId} = task
  if (integration?.service !== 'azureDevOps') return null
  const {instanceId, projectKey, issueKey, accessUserId} = integration
  const azureDevOpsWorkItem = await dataLoader.get('azureDevOpsWorkItem').load({
    teamId,
    userId: accessUserId,
    taskId,
    instanceId,
    projectId: projectKey,
    viewerId,
    workItemId: issueKey
  })
  return {
    repoId: AzureDevOpsProjectId.join(instanceId, projectKey),
    issueType: azureDevOpsWorkItem?.type ?? null
  }
}

export default resolveAzureDevOpsDimensionFieldKey
