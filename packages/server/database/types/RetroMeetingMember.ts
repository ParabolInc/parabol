import MeetingMember from './MeetingMember'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'

interface Input {
  id?: string
  isCheckedIn?: boolean
  updatedAt?: Date
  teamId: string
  userId: string
  meetingId: string
  votesRemaining: number
}

export default class RetroMeetingMember extends MeetingMember {
  votesRemaining: number
  constructor(input: Input) {
    const {votesRemaining, ...superInput} = input
    super({...superInput, meetingType: MeetingTypeEnum.retrospective})
    this.votesRemaining = votesRemaining
  }
}
