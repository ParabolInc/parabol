import MeetingMember from './MeetingMember'

interface Input {
  id?: string
  updatedAt?: Date
  teamId: string
  userId: string
  meetingId: string
}

export default class TeamPromptMeetingMember extends MeetingMember {
  meetingType!: 'teamPrompt'

  constructor(input: Input) {
    super({...input, meetingType: 'teamPrompt'})
  }
}
