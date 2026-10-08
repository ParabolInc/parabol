import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'

const parseAzureDevOpsIntegrationHash = (integrationHash: string) => {
  const {instanceId, projectKey, issueKey} = AzureDevOpsIssueId.split(integrationHash)
  if (
    !instanceId ||
    !projectKey ||
    !issueKey ||
    AzureDevOpsIssueId.join(instanceId, projectKey, issueKey) !== integrationHash ||
    !instanceId.startsWith('dev.azure.com/')
  ) {
    return null
  }
  return {service: 'azureDevOps' as const, instanceId, projectKey, issueKey}
}

export default parseAzureDevOpsIntegrationHash
