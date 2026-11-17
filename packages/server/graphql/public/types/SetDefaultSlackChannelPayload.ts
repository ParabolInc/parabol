import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import type {SetDefaultSlackChannelPayloadResolvers} from '../resolverTypes'

export type SetDefaultSlackChannelPayloadSource = {
  slackChannelId: string
  userId: string
  teamId: string
}

const SetDefaultSlackChannelPayload: SetDefaultSlackChannelPayloadResolvers = {
  teamMember: ({userId, teamId}, _args, {dataLoader}) => {
    const teamMemberId = toTeamMemberId(teamId, userId)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default SetDefaultSlackChannelPayload
