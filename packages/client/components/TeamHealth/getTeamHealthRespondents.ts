type TeamMember = {userId: string}
type MeetingMember = {userId: string; isSpectating?: boolean}

// who is expected to answer: everyone on the team except the spectators. Meeting members only
// exist once someone opens the meeting, so counting them would say "0 of 0" until the team shows up
export const getTeamHealthRespondents = <T extends TeamMember>(
  teamMembers: ReadonlyArray<T>,
  meetingMembers: ReadonlyArray<MeetingMember>
) => {
  const spectatorIds = new Set(
    meetingMembers.filter((member) => member.isSpectating).map((member) => member.userId)
  )
  return teamMembers.filter((teamMember) => !spectatorIds.has(teamMember.userId))
}
