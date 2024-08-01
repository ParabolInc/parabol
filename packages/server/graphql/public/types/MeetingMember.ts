import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {MeetingMemberResolvers} from '../resolverTypes'

const MeetingMember: MeetingMemberResolvers = {
  teamMember: ({teamId, userId}, _args, {dataLoader}) => {
    const teamMemberId = toTeamMemberId(teamId, userId)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  },
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default MeetingMember
