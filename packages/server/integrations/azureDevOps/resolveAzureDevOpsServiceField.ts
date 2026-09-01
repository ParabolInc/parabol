import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {ServiceField, ServiceFieldCtx} from '../platform/ServerIntegrationDefinition'

const resolveAzureDevOpsServiceField = async ({
  task,
  dataLoader,
  teamId,
  dimensionName,
  viewerId
}: ServiceFieldCtx): Promise<ServiceField | null> => {
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
  const workItemType = azureDevOpsWorkItem?.type ?? ''
  const azureDevOpsDimensionFieldMapEntry = await dataLoader
    .get('azureDevOpsDimensionFieldMap')
    .load({teamId, dimensionName, instanceId, projectKey, workItemType})
  if (azureDevOpsDimensionFieldMapEntry) {
    return {
      name: azureDevOpsDimensionFieldMapEntry.fieldName ?? '',
      type: azureDevOpsDimensionFieldMapEntry.fieldType
    }
  }
  return {name: SprintPokerDefaults.SERVICE_FIELD_COMMENT, type: 'string'}
}

export default resolveAzureDevOpsServiceField
