import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  webPath: string
  guid: string
}

export default class TaskIntegrationGitLab extends BaseTaskIntegration {
  webPath: string
  guid: string
  service!: 'gitlab'
  constructor(input: Input) {
    const {accessUserId, webPath, guid} = input
    super({accessUserId, service: 'gitlab'})
    this.webPath = webPath
    this.guid = guid
  }
}
