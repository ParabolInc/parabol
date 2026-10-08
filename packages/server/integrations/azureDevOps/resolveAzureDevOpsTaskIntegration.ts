import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveAzureDevOpsTaskIntegration = async ({task, dataLoader}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'azureDevOps') return null
  const {accessUserId, instanceId, issueKey} = integration
  return dataLoader
    .get('azureDevOpsWorkItem')
    .load({teamId, userId: accessUserId, instanceId, workItemId: issueKey})
}

export default resolveAzureDevOpsTaskIntegration
