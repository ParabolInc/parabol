import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'

type GitHubRepoIntegration = {
  nameWithOwner: string
  service: 'github'
}

export type JiraRepoIntegration = {
  cloudId: string
  projectKey?: string
  key?: string
  service: 'jira'
}

type GitLabRepoIntegration = {
  service: 'gitlab'
  fullPath: string
}

type AzureDevOpsRepoIntegration = {
  instanceId: string
  projectId: string
  service: 'azureDevOps'
}

type JiraServerRepoIntegration = {
  id: string
  providerId: number
  key: string
  service: 'jiraServer'
}

export type RepoIntegration =
  | GitHubRepoIntegration
  | JiraRepoIntegration
  | JiraServerRepoIntegration
  | AzureDevOpsRepoIntegration
  | GitLabRepoIntegration

const IntegrationRepoId = {
  join: (integration: RepoIntegration) => {
    const {service} = integration
    switch (service) {
      case 'github':
        return integration.nameWithOwner
      case 'jira':
        return JiraProjectId.join(integration.cloudId, integration.projectKey ?? integration.key!)
      case 'jiraServer':
        return `${integration.service}:${integration.providerId}:${integration.id}:${integration.key}`
      case 'azureDevOps':
        return AzureDevOpsProjectId.join(integration.instanceId, integration.projectId)
      case 'gitlab':
        return integration.fullPath
    }
  },
  split: (id: string) => {
    const parts = id.split(':')
    // Assume the input is valid
    const service = parts[0]!

    if (service === 'jiraServer') {
      return {
        service,
        providerId: parseInt(parts[1]!, 10),
        repositoryId: parts[2]!,
        projectKey: parts[3]!
      }
    }

    return {service, providerId: parseInt(parts[1]!, 10), repositoryId: parts[2]!}
  }
}

export default IntegrationRepoId
