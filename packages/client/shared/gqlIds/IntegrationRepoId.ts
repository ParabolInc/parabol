import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import {IntegrationProviderServiceEnum} from 'parabol-client/types/graphql'

export type GitHubItem = {
  nameWithOwner: string
  service: 'github'
}

export type JiraItem = {
  cloudId: string
  projectKey: string
  service: 'jira'
}

export type IntegrationRepoItem = {
  id: string
  providerId: string
  service: Exclude<IntegrationProviderServiceEnum, 'jira' | 'github'>
}

const IntegrationRepoId = {
  join: (item: GitHubItem | JiraItem | IntegrationRepoItem) => {
    const {service} = item
    switch (service) {
      case 'github':
        return item.nameWithOwner
      case 'jira':
        return JiraProjectId.join(item.cloudId, item.projectKey)
      case 'jiraServer':
        return item.id
      default:
        return `${item.service}:${item.providerId}:${item.id}`
    }
  }
}

export default IntegrationRepoId
