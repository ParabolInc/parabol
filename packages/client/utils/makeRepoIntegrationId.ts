type GitHubItem = {
  nameWithOwner: string
}

type JiraItem = {
  projectKey: string
  cloudId: string
}

const makeRepoIntegrationId = (item: GitHubItem | JiraItem) => {
  if ('nameWithOwner' in item) return item.nameWithOwner
  return `${item.cloudId}:${item.projectKey}`
}

export default makeRepoIntegrationId
