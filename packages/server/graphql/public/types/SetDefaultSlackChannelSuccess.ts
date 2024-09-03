import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {SetDefaultSlackChannelSuccessResolvers} from '../resolverTypes'

export type SetDefaultSlackChannelSuccessSource = {
  slackChannelId: string
  userId: string
  teamId: string
}

const SetDefaultSlackChannelSuccess: SetDefaultSlackChannelSuccessResolvers = {
  teamMember: ({userId, teamId}, _args, {dataLoader}) => {
    const teamMemberId = toTeamMemberId(teamId, userId)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default SetDefaultSlackChannelSuccess
