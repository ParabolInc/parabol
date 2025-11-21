import getKysely from '../../../postgres/getKysely'
import type {DataLoaderWorker} from '../../graphql'

const updateQualAIMeetingsCount = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const [meetingMembers, team, reflections, meeting] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').load(teamId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('newMeetings').loadNonNull(meetingId)
  ])
  if (meetingMembers.length < 3 || !team || !meeting.summary || reflections.length < 5) return
  const {qualAIMeetingsCount} = team
  const updates = {
    qualAIMeetingsCount: qualAIMeetingsCount + 1
  }
  await getKysely().updateTable('Team').set(updates).where('id', '=', teamId).execute()
  team.qualAIMeetingsCount = qualAIMeetingsCount + 1
}

export default updateQualAIMeetingsCount
