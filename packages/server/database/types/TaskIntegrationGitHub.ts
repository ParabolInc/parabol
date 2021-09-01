import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  nameWithOwner: string
  issueNumber: number
}

export default class TaskIntegrationGitHub extends BaseTaskIntegration {
  nameWithOwner: string
  issueNumber: number
  service!: 'github'
  constructor(input: Input) {
    const {accessUserId, nameWithOwner, issueNumber} = input
    super({accessUserId, service: 'github'})
    this.nameWithOwner = nameWithOwner
    this.issueNumber = issueNumber
  }
}
