import AzureDevOpsIssueId from '../../../client/shared/gqlIds/AzureDevOpsIssueId'
import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveAzureDevOpsTaskIntegration = async ({task, dataLoader, viewerId}: IssueReadCtx) => {
  const {integration, teamId, integrationHash} = task
  if (integration?.service !== 'azureDevOps') return null
  const {accessUserId, projectKey, issueKey} = integration
  const {instanceId} = AzureDevOpsIssueId.split(integrationHash!)
  return dataLoader.get('azureDevOpsWorkItem').load({
    teamId,
    userId: accessUserId,
    instanceId,
    projectId: projectKey,
    viewerId,
    workItemId: issueKey
  })
}

export default resolveAzureDevOpsTaskIntegration
