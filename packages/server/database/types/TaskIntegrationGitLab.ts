import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  providerId: string
  gid: string
}

export default class TaskIntegrationGitLab extends BaseTaskIntegration {
  providerId: string
  gid: string
  service!: 'gitlab'
  constructor(input: Input) {
    const {accessUserId, providerId, gid} = input
    super({accessUserId, service: 'gitlab'})
    this.providerId = providerId
    this.gid = gid
  }
}
