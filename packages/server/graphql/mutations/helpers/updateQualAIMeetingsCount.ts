import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {DataLoaderWorker} from '../../graphql'

const updateQualAIMeetingsCount = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const [meetingMembers, team, reflections, meeting] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').load(teamId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  if (meetingMembers.length < 3 || !team || !meeting.summary || reflections.length < 5) return
  const {qualAIMeetingsCount} = team
  const updates = {
    qualAIMeetingsCount: qualAIMeetingsCount + 1
  }
  await updateTeamByTeamId(updates, teamId)
  team.qualAIMeetingsCount = qualAIMeetingsCount + 1
}

export default updateQualAIMeetingsCount
