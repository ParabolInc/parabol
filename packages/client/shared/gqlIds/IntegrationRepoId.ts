import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'

export type GitHubItem = {
  cloudId?: null
  lastUsedAt?: Date
  nameWithOwner: string
  projectKey?: null
  service: 'github'
  userId: string
}

export type JiraItem = {
  cloudId: string
  lastUsedAt?: Date
  nameWithOwner?: null
  projectKey: string
  service: 'jira'
  userId: string
}

const IntegrationRepoId = {
  join: (item: GitHubItem | JiraItem) => {
    const {service} = item
    switch (service) {
      case 'github':
        return item.nameWithOwner
      case 'jira':
        return JiraProjectId.join(item.cloudId, item.projectKey)
      default:
        return ''
    }
  }
}

export default IntegrationRepoId
