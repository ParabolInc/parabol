import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'

type GitHubRepoIntegration = {
  nameWithOwner: string
  service: 'github'
}

type JiraRepoIntegration = {
  cloudId: string
  projectKey: string
  service: 'jira'
}

const IntegrationRepoId = {
  join: (integration: GitHubRepoIntegration | JiraRepoIntegration) => {
    const {service} = integration
    switch (service) {
      case 'github':
        return integration.nameWithOwner
      case 'jira':
        return JiraProjectId.join(integration.cloudId, integration.projectKey)
      default:
        return ''
    }
  }
}

export default IntegrationRepoId
