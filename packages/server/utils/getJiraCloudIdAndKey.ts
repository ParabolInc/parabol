const getJiraCloudIdAndKey = (id: string): [cloudId: string, issueKey: string] => {
  const [cloudId, issueKey] = id.split(':')
  return [cloudId, issueKey] as [cloudId: string, issueKey: string]
}
export default getJiraCloudIdAndKey
