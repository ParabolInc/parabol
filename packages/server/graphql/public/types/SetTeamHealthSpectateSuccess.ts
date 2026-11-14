import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import type {SetTeamHealthSpectateSuccessResolvers} from '../resolverTypes'

export type SetTeamHealthSpectateSuccessSource = {
  meetingId: string
  teamId: string
  userId: string
}

const SetTeamHealthSpectateSuccess: SetTeamHealthSpectateSuccessResolvers = {
  meetingMember: async ({userId, meetingId}, _args, {dataLoader}) => {
    const meetingMemberId = MeetingMemberId.join(meetingId, userId)
    return dataLoader.get('meetingMembers').loadNonNull(meetingMemberId)
  }
}

export default SetTeamHealthSpectateSuccess
