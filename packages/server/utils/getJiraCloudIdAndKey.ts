const getJiraCloudIdAndKey = (id: string) => {
  const [cloudId, issueKey] = id.split(':')
  return [cloudId, issueKey] as [string, string]
}
export default getJiraCloudIdAndKey
