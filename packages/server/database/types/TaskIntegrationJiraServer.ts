import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  providerId: number
  issueId: string
  repositoryId: string
}

export default class TaskIntegrationJiraServer extends BaseTaskIntegration {
  providerId: number
  issueId: string
  repositoryId: string
  service!: 'jiraServer'
  constructor(input: Input) {
    const {accessUserId, providerId, issueId, repositoryId} = input
    super({accessUserId, service: 'jiraServer'})
    this.providerId = providerId
    this.issueId = issueId
    this.repositoryId = repositoryId
  }
}
