import type {DimensionFieldCtx, ServiceFieldListing} from '../platform/ServerIntegrationDefinition'

/** Read from the work item's own type, so custom types and inherited processes list what they really have */
const listAzureDevOpsDimensionFields = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<ServiceFieldListing> => {
  const {integration} = task
  if (integration?.service !== 'azureDevOps') return {options: []}
  const {accessUserId, instanceId, issueKey} = integration
  const workItem = await dataLoader
    .get('azureDevOpsWorkItem')
    .load({teamId, userId: accessUserId, instanceId, workItemId: issueKey})
  if (!workItem) return {options: []}
  const options = await dataLoader.get('azureDevOpsEstimateFields').load({
    teamId,
    userId: accessUserId,
    instanceId,
    projectId: workItem.teamProject,
    workItemType: workItem.type
  })
  return {options}
}

export default listAzureDevOpsDimensionFields
