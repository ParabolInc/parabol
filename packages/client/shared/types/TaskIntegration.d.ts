interface BaseTaskIntegration {
  service: 'jira' | 'jiraServer' | 'github' | 'gitlab' | 'azureDevOps' | 'linear' | 'clickup'
  accessUserId: string
}

interface TaskIntegrationJira extends BaseTaskIntegration {
  service: 'jira'
  cloudId: string
  issueKey: string
  projectKey: string
}

interface TaskIntegrationJiraServer extends BaseTaskIntegration {
  service: 'jiraServer'
  providerId: number
  issueId: string
  repositoryId: string
}

interface TaskIntegrationGitHub extends BaseTaskIntegration {
  service: 'github'
  nameWithOwner: string
  issueNumber: number
}

interface TaskIntegrationGitLab extends BaseTaskIntegration {
  service: 'gitlab'
  providerId: string
  gid: string
}

interface TaskIntegrationAzureDevOps extends BaseTaskIntegration {
  service: 'azureDevOps'
  instanceId: string
  issueKey: string
  projectKey: string
}
interface TaskIntegrationLinear extends BaseTaskIntegration {
  service: 'linear'
  repoId: string
  issueId: string
}

interface TaskIntegrationClickUp extends BaseTaskIntegration {
  service: 'clickup'
  repoId: string
  issueId: string
}

export type AnyTaskIntegration =
  | TaskIntegrationJira
  | TaskIntegrationJiraServer
  | TaskIntegrationGitHub
  | TaskIntegrationGitLab
  | TaskIntegrationAzureDevOps
  | TaskIntegrationLinear
  | TaskIntegrationAzureDevOps
  | TaskIntegrationClickUp

export type TaskServiceEnum = AnyTaskIntegration['service'] | 'PARABOL'
