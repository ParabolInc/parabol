import MeetingMember from './MeetingMember'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'

interface Input {
  id?: string
  isCheckedIn?: boolean
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
