import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  instanceId: string
  projectKey: string
  issueKey: string
}

export default class TaskIntegrationAzureDevOps extends BaseTaskIntegration {
  instanceId: string
  issueKey: string
  projectKey: string
  service!: 'azureDevOps'
  constructor(input: Input) {
    const {accessUserId, instanceId, projectKey, issueKey} = input
    super({accessUserId, service: 'azureDevOps'})
    this.projectKey = projectKey
    this.instanceId = instanceId
    this.issueKey = issueKey
  }
}
