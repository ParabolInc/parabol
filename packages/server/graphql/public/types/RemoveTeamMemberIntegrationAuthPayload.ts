import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import type {RemoveTeamMemberIntegrationAuthPayloadResolvers} from '../resolverTypes'

export type RemoveTeamMemberIntegrationAuthPayloadSource = {
  service: string
  teamId: string
  userId: string
}

const RemoveTeamMemberIntegrationAuthPayload: RemoveTeamMemberIntegrationAuthPayloadResolvers = {
  teamMember: ({teamId, userId}, _args, {dataLoader}) => {
    const teamMemberId = toTeamMemberId(teamId, userId)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  },
  user: async ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default RemoveTeamMemberIntegrationAuthPayload
