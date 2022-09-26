import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'

type GitHubRepoIntegration = {
  nameWithOwner: string
  service: 'github'
}

export type JiraRepoIntegration = {
  cloudId: string
  projectKey: string
  service: 'jira'
}

type GitLabRepoIntegration = {
  providerId: string
  gid: string
  service: 'gitlab'
}

type AzureDevOpsRepoIntegration = {
  instanceId: string
  projectId: string
  service: 'azureDevOps'
}

type JiraServerRepoIntegration = {
  id: string
  providerId: string
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
        return JiraProjectId.join(integration.cloudId, integration.projectKey)
      case 'jiraServer':
        return `${integration.service}:${integration.providerId}:${integration.id}:${integration.key}`
      case 'azureDevOps':
        return AzureDevOpsProjectId.join(integration.instanceId, integration.projectId)
      case 'gitlab':
        return integration.gid // TODO: change to full path as its the case in MenuList

      // default: TODO: test jira server and see why this was added
      // return `${integration.service}:${integration.providerId}:${integration.id}`
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
