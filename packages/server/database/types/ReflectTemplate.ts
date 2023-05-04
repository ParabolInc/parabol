import MeetingTemplate, {SharingScopeEnum} from './MeetingTemplate'

interface Input {
  name: string
  teamId: string
  scope?: SharingScopeEnum
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date | null
  illustrationUrl: string | null
  mainCategory: string | null
}

export default class ReflectTemplate extends MeetingTemplate {
  constructor(input: Input) {
    super({...input, type: 'retrospective'})
  }
}
