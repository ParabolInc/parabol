import MeetingMember from './MeetingMember'

interface Input {
  id?: string
  updatedAt?: Date
  teamId: string
  userId: string
  meetingId: string
}

export default class PokerMeetingMember extends MeetingMember {
  constructor(input: Input) {
    super({...input, meetingType: 'poker'})
  }
}
