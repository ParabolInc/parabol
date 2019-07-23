import MeetingMember from 'server/database/types/MeetingMember'

export default class RetroMeetingMember extends MeetingMember {
  constructor (
    teamId: string,
    userId: string,
    meetingType: string,
    meetingId: string,
    public votesRemaining: number
  ) {
    super(teamId, userId, meetingType, meetingId)
  }
}
