import TaskIntegration from './TaskIntegration'

interface Input {
  accessUserId: string
  nameWithOwner: string
  issueNumber: string | number
}

export default class TaskIntegrationGitHub extends TaskIntegration {
  nameWithOwner: string
  issueNumber: string | number
  service!: 'github'
  constructor(input: Input) {
    const {accessUserId, nameWithOwner, issueNumber} = input
    super({accessUserId, service: 'github'})
    this.nameWithOwner = nameWithOwner
    this.issueNumber = issueNumber
  }
}
