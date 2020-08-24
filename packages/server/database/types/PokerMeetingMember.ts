import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import MeetingMember from './MeetingMember'

interface Input {
  id?: string
  isCheckedIn?: boolean
  updatedAt?: Date
  teamId: string
  userId: string
  meetingId: string
}

export default class PokerMeetingMember extends MeetingMember {
  constructor(input: Input) {
    super({...input, meetingType: MeetingTypeEnum.poker})
  }
}
