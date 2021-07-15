import TaskIntegration from './TaskIntegration'

interface Input {
  accessUserId: string
  projectKey: string
  projectName?: string
  cloudId: string
  issueKey: string
  cloudName: string
}

export default class TaskIntegrationJira extends TaskIntegration {
  projectKey: string
  projectName?: string
  cloudId: string
  issueKey: string
  cloudName: string
  service!: 'jira'
  constructor(input: Input) {
    const {accessUserId, projectKey, projectName, cloudId, cloudName, issueKey} = input
    super({accessUserId, service: 'jira'})
    this.projectKey = projectKey
    this.projectName = projectName
    this.cloudId = cloudId
    this.issueKey = issueKey
    this.cloudName = cloudName
  }
}
