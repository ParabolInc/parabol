import fromTeamMemberId from '../../../../client/utils/relay/fromTeamMemberId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {NewMeetingTeamMemberStageResolvers} from '../resolverTypes'

const NewMeetingTeamMemberStage: NewMeetingTeamMemberStageResolvers = {
  meetingMember: async ({meetingId, teamMemberId}, _args, {dataLoader}) => {
    const {userId} = fromTeamMemberId(teamMemberId)
    const meetingMemberId = toTeamMemberId(meetingId, userId)
    return dataLoader.get('meetingMembers').loadNonNull(meetingMemberId)
  },
  teamMember: async ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default NewMeetingTeamMemberStage
