import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

export default class MeetingMember {
  id: string
  isCheckedIn = null
  updatedAt = new Date()
  constructor (
    public teamId: string,
    public userId: string,
    public meetingType: string,
    public meetingId: string
  ) {
    this.id = toTeamMemberId(meetingId, userId)
  }
}
