import AzureDevOpsProjectKeyId from './AzureDevOpsProjectKeyId'
const AzureDevOpsIssueId = {
  join: (instanceId: string, issueKey: string) => `${instanceId}:${issueKey}`,
  split: (id: string) => {
    const firstColonIdx = id.indexOf(':')
    const instanceId = id.slice(0, firstColonIdx)
    const issueKey = id.slice(firstColonIdx + 1)
    const projectKey = AzureDevOpsProjectKeyId.join(issueKey)
    return {instanceId, issueKey, projectKey}
  }
}

export default AzureDevOpsIssueId
