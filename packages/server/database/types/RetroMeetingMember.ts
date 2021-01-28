import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import MeetingMember from './MeetingMember'

interface Input {
  id?: string
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
