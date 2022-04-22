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

export type RepoIntegration = {
  id: string
  providerId: string
  service: Exclude<IntegrationProviderServiceEnum, 'jira' | 'github'>
}

const IntegrationRepoId = {
  join: (integration: GitHubRepoIntegration | JiraRepoIntegration | RepoIntegration) => {
    const {service} = integration
    switch (service) {
      case 'github':
        return integration.nameWithOwner
      case 'jira':
        return JiraProjectId.join(integration.cloudId, integration.projectKey)
      default:
        return `${integration.service}:${integration.providerId}:${integration.id}`
    }
  },
  split: (id: string) => {
    const parts = id.split(':')
    // Assume the input is valid
    return {service: parts[0]!, providerId: parseInt(parts[1]!, 10), repositoryId: parts[2]!}
  }
}

export default IntegrationRepoId
