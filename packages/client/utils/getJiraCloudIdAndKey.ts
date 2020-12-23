const getJiraCloudIdAndKey = (serviceTaskId: string) => {
  const firstColonIdx = serviceTaskId.indexOf(':')
  const cloudId = serviceTaskId.slice(0, firstColonIdx)
  const issueKey = serviceTaskId.slice(firstColonIdx + 1)
  const projectKey = issueKey.slice(0, issueKey.indexOf('-'))
  return [cloudId, issueKey, projectKey] as [cloudId: string, issueKey: string, projectKey: string]
}
export default getJiraCloudIdAndKey
