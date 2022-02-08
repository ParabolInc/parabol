import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'

export type GitHubItem = {
  cloudId?: null
  nameWithOwner: string
  projectKey?: null
  service: 'github'
}

export type JiraItem = {
  cloudId: string
  nameWithOwner?: null
  projectKey: string
  service: 'jira'
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
