import {fieldTypeToId} from '../../utils/azureDevOps/azureDevOpsFieldTypeToId'
import type {DimensionFieldCtx, ServiceFieldListing} from '../platform/ServerIntegrationDefinition'
import azureDevOpsDimensionFieldOptions from './azureDevOpsDimensionFieldOptions'

const isKnownWorkItemType = (type: string): type is keyof typeof fieldTypeToId =>
  Object.hasOwn(fieldTypeToId, type)

const listAzureDevOpsDimensionFields = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<ServiceFieldListing> => {
  const {integration} = task
  if (integration?.service !== 'azureDevOps') return {options: []}
  const {accessUserId, instanceId, issueKey, projectKey} = integration
  const workItem = await dataLoader.get('azureDevOpsWorkItem').load({
    teamId,
    userId: accessUserId,
    instanceId,
    projectId: projectKey,
    viewerId: accessUserId,
    workItemId: issueKey
  })
  if (!workItem || !isKnownWorkItemType(workItem.type)) return {options: []}
  const option = azureDevOpsDimensionFieldOptions[fieldTypeToId[workItem.type]]
  return {options: option ? [option] : []}
}

export default listAzureDevOpsDimensionFields
