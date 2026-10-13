import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'

const resolveAzureDevOpsDimensionFieldKey = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration} = task
  if (integration?.service !== 'azureDevOps') return null
  const {instanceId, issueKey, accessUserId} = integration
  const workItem = await dataLoader
    .get('azureDevOpsWorkItem')
    .load({teamId, userId: accessUserId, instanceId, workItemId: issueKey})
  if (!workItem) return null
  return {
    repoId: AzureDevOpsProjectId.join(instanceId, workItem.teamProject),
    issueType: workItem.type
  }
}

export default resolveAzureDevOpsDimensionFieldKey
