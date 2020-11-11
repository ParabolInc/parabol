const getJiraCloudIdAndKey = (id: string): [string, string] => {
  const [cloudId, key] = id.split(':')
  return [cloudId, key]
}
export default getJiraCloudIdAndKey
