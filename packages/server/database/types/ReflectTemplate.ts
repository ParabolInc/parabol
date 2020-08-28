import MeetingTemplate from './MeetingTemplate'

interface Input {
  name: string
  teamId: string
  scope?: string
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date
}

export default class ReflectTemplate extends MeetingTemplate {
  constructor(input: Input) {
    super({...input, type: 'retrospective'})
  }
}
