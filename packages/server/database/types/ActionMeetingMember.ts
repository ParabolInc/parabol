import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import MeetingMember from './MeetingMember'

interface Input {
  id?: string
  updatedAt?: Date
  teamId: string
  userId: string
  meetingId: string
}

export default class ActionMeetingMember extends MeetingMember {
  constructor(input: Input) {
    super({...input, meetingType: MeetingTypeEnum.action})
  }
}
