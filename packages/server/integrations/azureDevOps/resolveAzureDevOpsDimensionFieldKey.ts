import AzureDevOpsProjectId from 'parabol-client/integrations/azureDevOps/shared/AzureDevOpsProjectId'
import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'

const resolveAzureDevOpsDimensionFieldKey = async ({
  task,
  dataLoader,
  teamId
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration} = task
  if (integration?.service !== 'azureDevOps') return null
  const issue = await dataLoader.get('integrationIssue').load({teamId, integration})
  if (issue?.service !== 'azureDevOps') return null
  return {
    repoId: AzureDevOpsProjectId.join(integration.instanceId, issue.teamProject),
    issueType: issue.type
  }
}

export default resolveAzureDevOpsDimensionFieldKey
