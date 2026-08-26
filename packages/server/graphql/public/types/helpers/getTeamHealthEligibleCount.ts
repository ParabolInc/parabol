import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'

// Everyone on the team who is expected to answer, less anyone sitting the cycle out as a spectator.
// Deliberately not derived from who opened the meeting: counting attendees is what let a cycle read
// "3 of 3 answered" while seven teammates never showed up, which is the one number that would have
// told the lead the cycle was in trouble.
export const getTeamHealthEligibleCount = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderInstance
) => {
  const [teamMembers, meetingMembers] = await Promise.all([
    dataLoader.get('teamMembersByTeamId').load(teamId),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  ])
  const spectatorUserIds = new Set(
    meetingMembers.filter(({isSpectating}) => isSpectating).map(({userId}) => userId)
  )
  return teamMembers.filter(({userId}) => !spectatorUserIds.has(userId)).length
}
