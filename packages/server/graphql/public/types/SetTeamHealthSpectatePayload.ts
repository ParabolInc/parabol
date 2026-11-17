import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import type {SetTeamHealthSpectatePayloadResolvers} from '../resolverTypes'

export type SetTeamHealthSpectatePayloadSource = {
  meetingId: string
  teamId: string
  userId: string
}

const SetTeamHealthSpectatePayload: SetTeamHealthSpectatePayloadResolvers = {
  meetingMember: async ({userId, meetingId}, _args, {dataLoader}) => {
    const meetingMemberId = MeetingMemberId.join(meetingId, userId)
    return dataLoader.get('meetingMembers').loadNonNull(meetingMemberId)
  }
}

export default SetTeamHealthSpectatePayload
