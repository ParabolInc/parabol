const getJiraCloudIdAndKey = (serviceTaskId: string) => {
  const [cloudId, issueKey] = serviceTaskId.split(':')
  return [cloudId, issueKey] as [cloudId: string, issueKey: string]
}
export default getJiraCloudIdAndKey
