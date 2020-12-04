import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import {SharingScopeEnum} from '../../../client/types/graphql'
import MeetingTemplate from './MeetingTemplate'

interface Input {
  name: string
  teamId: string
  scope?: SharingScopeEnum
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date
}

export default class ReflectTemplate extends MeetingTemplate {
  constructor(input: Input) {
    super({...input, type: MeetingTypeEnum.retrospective})
  }
}
