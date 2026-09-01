import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import {fieldTypeToId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import type {EstimatePushCtx, EstimatePushResult} from '../platform/ServerIntegrationDefinition'

const pushEstimateToAzureDevOps = async ({
  task,
  taskEstimate,
  dataLoader,
  meetingName,
  discussionURL
}: EstimatePushCtx): Promise<EstimatePushResult | Error> => {
  const {integration, teamId} = task
  if (integration?.service !== 'azureDevOps') return new Error('Not an Azure DevOps task')
  const {dimensionName, value} = taskEstimate
  const {accessUserId, instanceId, issueKey, projectKey} = integration

  const [auth, azureDevOpsWorkItem] = await Promise.all([
    dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId: accessUserId}),
    dataLoader.get('azureDevOpsWorkItem').load({
      teamId,
      userId: accessUserId,
      instanceId,
      projectId: projectKey,
      viewerId: accessUserId,
      workItemId: issueKey
    })
  ])

  if (!auth) {
    return new Error('User no longer has access to Azure DevOps')
  }

  const workItemType = azureDevOpsWorkItem?.type ? azureDevOpsWorkItem?.type : ''

  const azureDevOpsDimensionFieldMapEntry = await dataLoader
    .get('azureDevOpsDimensionFieldMap')
    .load({
      teamId,
      dimensionName,
      instanceId,
      projectKey,
      workItemType
    })

  const fieldName = azureDevOpsDimensionFieldMapEntry
    ? azureDevOpsDimensionFieldMapEntry.fieldName
    : SprintPokerDefaults.SERVICE_FIELD_COMMENT.toString()

  const fieldType = azureDevOpsDimensionFieldMapEntry
    ? azureDevOpsDimensionFieldMapEntry.fieldType
    : 'string'

  if (!azureDevOpsWorkItem) {
    return new Error('Cannot find the correct work item to push changes to.')
  }

  const manager = new AzureDevOpsServerManager(auth, null)

  if (fieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const res = await manager.addScoreComment(
      instanceId,
      dimensionName,
      value,
      meetingName,
      discussionURL,
      issueKey,
      projectKey
    )
    if ('message' in res) {
      return new Error(res.message)
    }
  } else if (fieldName !== SprintPokerDefaults.SERVICE_FIELD_NULL) {
    const fieldId = fieldTypeToId[azureDevOpsWorkItem.type as keyof typeof fieldTypeToId]
    try {
      const updatedStoryPoints = fieldType === 'string' ? value : Number(value)
      await manager.addScoreField(instanceId, fieldId, updatedStoryPoints, issueKey, projectKey)
    } catch (e) {
      return new Error(e instanceof Error ? e.message : 'Unable to updateStoryPoints')
    }
  }
  return null
}

export default pushEstimateToAzureDevOps
