import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  webPath: string
  gid: string
}

export default class TaskIntegrationGitLab extends BaseTaskIntegration {
  webPath: string
  gid: string
  service!: 'gitlab'
  constructor(input: Input) {
    const {accessUserId, webPath, gid} = input
    super({accessUserId, service: 'gitlab'})
    this.webPath = webPath
    this.gid = gid
  }
}
