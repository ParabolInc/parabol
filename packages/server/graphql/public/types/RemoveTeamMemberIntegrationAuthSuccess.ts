import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {RemoveTeamMemberIntegrationAuthSuccessResolvers} from '../resolverTypes'

export type RemoveTeamMemberIntegrationAuthSuccessSource = {
  service: string
  teamId: string
  userId: string
}

const RemoveTeamMemberIntegrationAuthSuccess: RemoveTeamMemberIntegrationAuthSuccessResolvers = {
  teamMember: ({teamId, userId}, _args, {dataLoader}) => {
    const teamMemberId = toTeamMemberId(teamId, userId)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  },
  user: async ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default RemoveTeamMemberIntegrationAuthSuccess
