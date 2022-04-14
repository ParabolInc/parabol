import AzureDevOpsProjectKeyId from './AzureDevOpsProjectKeyId'
const AzureDevOpsIssueId = {
  join: (instanceId: string, projectKey: string, issueKey: string) => `${instanceId}:${projectKey}:${issueKey}`,
  split: (id: string) => {
    const firstColonIdx = id.indexOf(':')
    const instanceId = id.slice(0, firstColonIdx)
    const projectWorkItem = id.slice(firstColonIdx + 1)
    const secondColonIdx = projectWorkItem.indexOf(':')
    const projectKey = projectWorkItem.slice(0, secondColonIdx)
    const issueKey = projectWorkItem.slice(secondColonIdx + 1)
    return {instanceId, issueKey, projectKey}
  }
}

export default AzureDevOpsIssueId
