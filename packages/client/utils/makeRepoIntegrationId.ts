type GitHubItem = {
  cloudId?: null
  lastUsedAt?: string
  nameWithOwner: string
  projectKey?: null
  service: 'github'
  userId: string
}

type JiraItem = {
  cloudId: string
  lastUsedAt?: string
  nameWithOwner?: null
  projectKey: string
  service: 'jira'
  userId: string
}

const makeRepoIntegrationId = (item: GitHubItem | JiraItem) => {
  const {service} = item
  switch (service) {
    case 'github':
      return item.nameWithOwner
    case 'jira':
      return `${item.cloudId}:${item.projectKey}`
  }
}

export default makeRepoIntegrationId
