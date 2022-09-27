import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  providerId: number
  issueId: string
  repositoryId: string
  name: string
  key: string
}

export default class TaskIntegrationJiraServer extends BaseTaskIntegration {
  providerId: number
  issueId: string
  repositoryId: string
  name: string
  key: string
  service!: 'jiraServer'
  constructor(input: Input) {
    const {accessUserId, providerId, issueId, repositoryId, name, key} = input
    super({accessUserId, service: 'jiraServer'})
    this.providerId = providerId
    this.issueId = issueId
    this.repositoryId = repositoryId
    this.name = name
    this.key = key
  }
}
