import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

const createMeetingMember = (meetingId, meetingType) => (teamMember) => ({
  id: toTeamMemberId(meetingId, teamMember.userId),
  isCheckedIn: null,
  meetingId,
  meetingType,
  teamId: teamMember.teamId,
  userId: teamMember.userId,
  updatedAt: new Date()
})

export default createMeetingMember
