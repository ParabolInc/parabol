import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import {IntegrationProviderServiceEnum} from 'parabol-client/__generated__/CreateTaskIntegrationMutation.graphql'

type GitHubRepoIntegration = {
  nameWithOwner: string
  service: 'github'
}

type JiraRepoIntegration = {
  cloudId: string
  projectKey: string
  service: 'jira'
}

type JiraServerRepoIntegration = {
  id: string
  providerId: string
  key: string
  service: 'jiraServer'
}

export type RepoIntegration = {
  id: string
  providerId: string
  service: Exclude<IntegrationProviderServiceEnum, 'jira' | 'jiraServer' | 'github'>
}

const IntegrationRepoId = {
  join: (integration: GitHubRepoIntegration | JiraRepoIntegration | RepoIntegration | JiraServerRepoIntegration) => {
    const {service} = integration
    switch (service) {
      case 'github':
        return integration.nameWithOwner
      case 'jira':
        return JiraProjectId.join(integration.cloudId, integration.projectKey)
      case 'jiraServer':
        return `${integration.service}:${integration.providerId}:${integration.id}:${integration.key}`
      default:
        return `${integration.service}:${integration.providerId}:${integration.id}`
    }
  },
  split: (id: string) => {
    const parts = id.split(':')
    // Assume the input is valid
    const service = parts[0]!

    if (service === 'jiraServer') {
      return {service, providerId: parseInt(parts[1]!, 10), repositoryId: parts[2]!, projectKey: parts[3]!}
    }

    return {service, providerId: parseInt(parts[1]!, 10), repositoryId: parts[2]!}
  }
}

export default IntegrationRepoId
