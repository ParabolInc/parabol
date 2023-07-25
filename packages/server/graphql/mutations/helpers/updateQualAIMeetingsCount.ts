import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import {DataLoaderWorker} from '../../graphql'

const updateQualAIMeetingsCount = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const [meetingMembers, team, reflections, meeting, responses] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').load(teamId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('newMeetings').load(meetingId),
    getTeamPromptResponsesByMeetingId(meetingId)
  ])
  if (
    meetingMembers.length < 3 ||
    !team ||
    !meeting.summary ||
    !(reflections.length >= 5 || responses.length >= 3)
  )
    return
  const {qualAIMeetingsCount} = team
  const updates = {
    qualAIMeetingsCount: qualAIMeetingsCount + 1
  }
  await updateTeamByTeamId(updates, teamId)
  team.qualAIMeetingsCount = qualAIMeetingsCount + 1
}

export default updateQualAIMeetingsCount
