import {SharingScopeEnum} from '~/__generated__/OrganizationSubscription.graphql'
import MeetingTemplate from './MeetingTemplate'

interface Input {
  name: string
  teamId: string
  scope?: SharingScopeEnum
  orgId: string
  parentTemplateId?: string
  lastUsedAt?: Date
}

export default class PokerTemplate extends MeetingTemplate {
  constructor(input: Input) {
    super({...input, type: 'poker'})
  }
}
