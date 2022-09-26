import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  providerId: string
  gid: string
  fullPath: string
}

export default class TaskIntegrationGitLab extends BaseTaskIntegration {
  providerId: string
  gid: string
  fullPath: string
  service!: 'gitlab'
  constructor(input: Input) {
    const {accessUserId, providerId, gid, fullPath} = input
    super({accessUserId, service: 'gitlab'})
    this.providerId = providerId
    this.gid = gid
    this.fullPath = fullPath
  }
}
