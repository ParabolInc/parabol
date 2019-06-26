import {DataLoaderWorker} from 'server/graphql/graphql'

const getUsersToIgnore = async (
  meetingId: string | undefined | null,
  dataLoader: DataLoaderWorker
) => {
  if (!meetingId) return []
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  return meetingMembers.filter((member) => member.isCheckedIn).map(({userId}) => userId)
}

export default getUsersToIgnore
