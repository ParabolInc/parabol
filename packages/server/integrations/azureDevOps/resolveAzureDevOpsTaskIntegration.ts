import type {IssueReadCtx} from '../platform/ServerIntegrationDefinition'

const resolveAzureDevOpsTaskIntegration = async ({task, dataLoader}: IssueReadCtx) => {
  const {integration, teamId} = task
  if (integration?.service !== 'azureDevOps') return null
  return dataLoader.get('integrationIssue').load({teamId, integration})
}

export default resolveAzureDevOpsTaskIntegration
