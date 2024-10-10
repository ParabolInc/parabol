import {DataLoaderWorker} from '../graphql/graphql'

const getBestInvitationMeeting = async (
  teamId: string,
  maybeMeetingId: string | undefined | null,
  dataLoader: DataLoaderWorker
) => {
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const invitedMeeting = activeMeetings.find((meeting) => meeting.id === maybeMeetingId)
  return invitedMeeting || activeMeetings[0]
}

export default getBestInvitationMeeting
