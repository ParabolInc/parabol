import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'
import loadDimensionField from '../platform/loadDimensionField'
import type {EstimatePushCtx} from '../platform/ServerIntegrationDefinition'
import {toAzureDevOpsFieldReferenceName} from './azureDevOpsEstimateFields'
import getAzureDevOpsManager from './getAzureDevOpsManager'
import resolveAzureDevOpsDimensionFieldKey from './resolveAzureDevOpsDimensionFieldKey'

const pushEstimateToAzureDevOps = async ({
  task,
  taskEstimate,
  dataLoader,
  context,
  info,
  viewerId,
  meetingName,
  discussionURL
}: EstimatePushCtx): Promise<EstimatePushResult | Error> => {
  const {integration, teamId} = task
  if (integration?.service !== 'azureDevOps') return new Error('Not an Azure DevOps task')
  const {dimensionName, value} = taskEstimate
  const {accessUserId, instanceId, issueKey} = integration

  const [manager, workItem] = await Promise.all([
    getAzureDevOpsManager({dataLoader, teamId, userId: accessUserId}),
    dataLoader
      .get('azureDevOpsWorkItem')
      .load({teamId, userId: accessUserId, instanceId, workItemId: issueKey})
  ])
  if (!manager) return new Error('User no longer has access to Azure DevOps')
  if (!workItem) {
    return new Error(
      'Cannot find the work item. Its project may no longer be shared with this team'
    )
  }

  const dimensionFieldLookup = await loadDimensionField(
    resolveAzureDevOpsDimensionFieldKey,
    {dataLoader, teamId, userId: accessUserId, context, info, task, viewerId},
    dimensionName
  )
  const dimensionField = dimensionFieldLookup?.field
  const fieldId = dimensionField?.fieldId ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT
  if (fieldId === SprintPokerDefaults.SERVICE_FIELD_NULL) return null

  const projectId = workItem.teamProject
  if (fieldId === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const res = await manager.addScoreComment({
      instanceId,
      projectId,
      workItemId: issueKey,
      dimensionName,
      finalScore: value,
      meetingName,
      discussionURL
    })
    return res instanceof Error ? res : null
  }

  const fieldValue = dimensionField?.fieldType === 'string' ? value : Number(value)
  if (typeof fieldValue === 'number' && !Number.isFinite(fieldValue)) {
    const fieldName = dimensionField?.fieldName ?? 'That Azure DevOps field'
    return new Error(`${fieldName} only takes numbers, so "${value}" was not saved`)
  }
  const referenceName = toAzureDevOpsFieldReferenceName(fieldId)
  const res = await manager.setField(instanceId, projectId, issueKey, referenceName, fieldValue)
  if (res instanceof Error) return res
  return {service: 'azureDevOps', target: 'field', targetId: referenceName}
}

export default pushEstimateToAzureDevOps
