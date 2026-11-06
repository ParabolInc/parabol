import AzureDevOpsIssueId from 'parabol-client/integrations/azureDevOps/shared/AzureDevOpsIssueId'
import {isAzureDevOpsInstanceId} from './AzureDevOpsServerManager'

const parseAzureDevOpsIntegrationHash = (integrationHash: string) => {
  const {instanceId, projectKey, issueKey} = AzureDevOpsIssueId.split(integrationHash)
  if (
    !projectKey ||
    !/^\d+$/.test(issueKey) ||
    AzureDevOpsIssueId.join(instanceId, projectKey, issueKey) !== integrationHash ||
    !isAzureDevOpsInstanceId(instanceId)
  ) {
    return null
  }
  return {service: 'azureDevOps' as const, instanceId, projectKey, issueKey}
}

export default parseAzureDevOpsIntegrationHash
