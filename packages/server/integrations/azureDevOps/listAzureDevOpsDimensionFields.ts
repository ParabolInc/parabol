import type {DimensionFieldCtx, ServiceFieldListing} from '../platform/ServerIntegrationDefinition'

/** Read from the issue's own type, so custom types and inherited processes list what they really have */
const listAzureDevOpsDimensionFields = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<ServiceFieldListing> => {
  const {integration} = task
  if (integration?.service !== 'azureDevOps') return {options: []}
  const {accessUserId, instanceId} = integration
  const issue = await dataLoader.get('integrationIssue').load({teamId, integration})
  if (issue?.service !== 'azureDevOps') return {options: []}
  const options = await dataLoader.get('azureDevOpsEstimateFields').load({
    teamId,
    userId: accessUserId,
    instanceId,
    projectId: issue.teamProject,
    workItemType: issue.type
  })
  return {options}
}

export default listAzureDevOpsDimensionFields
