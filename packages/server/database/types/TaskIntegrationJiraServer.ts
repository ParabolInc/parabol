import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  providerId: number
}

export default class TaskIntegrationJiraServer extends BaseTaskIntegration {
  providerId: number
  service!: 'jiraServer'
  constructor(input: Input) {
    const {accessUserId, providerId} = input
    super({accessUserId, service: 'jiraServer'})
    this.providerId = providerId
  }
}
