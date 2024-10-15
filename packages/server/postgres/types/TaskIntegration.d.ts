interface BaseTaskIntegration {
  service: 'jira' | 'jiraServer' | 'github' | 'gitlab' | 'azureDevOps'
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

export type AnyTaskIntegration =
  | TaskIntegrationJira
  | TaskIntegrationJiraServer
  | TaskIntegrationGitHub
  | TaskIntegrationGitLab
  | TaskIntegrationAzureDevOps

export type TaskServiceEnum = AnyTaskIntegration['service'] | 'PARABOL'
