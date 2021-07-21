import TaskIntegration from './TaskIntegration'

interface Input {
  accessUserId: string
  cloudId: string
  issueKey: string
}

export default class TaskIntegrationJira extends TaskIntegration {
  cloudId: string
  issueKey: string
  service!: 'jira'
  constructor(input: Input) {
    const {accessUserId, cloudId, issueKey} = input
    super({accessUserId, service: 'jira'})
    this.cloudId = cloudId
    this.issueKey = issueKey
  }
}
