import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  instanceId: string
  projectKey: string
  issueKey: string
  name: string
  url: string
}

export default class TaskIntegrationAzureDevOps extends BaseTaskIntegration {
  instanceId: string
  issueKey: string
  projectKey: string
  name: string
  url: string
  service!: 'azureDevOps'
  constructor(input: Input) {
    const {accessUserId, instanceId, projectKey, issueKey, name, url} = input
    super({accessUserId, service: 'azureDevOps'})
    this.projectKey = projectKey
    this.instanceId = instanceId
    this.issueKey = issueKey
    this.name = name
    this.url = url
  }
}
