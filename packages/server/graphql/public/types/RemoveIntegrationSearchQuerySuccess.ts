import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import type {RemoveIntegrationSearchQuerySuccessResolvers} from '../resolverTypes'

export type RemoveIntegrationSearchQuerySuccessSource = {
  teamId: string
  userId: string
}

const RemoveIntegrationSearchQuerySuccess: RemoveIntegrationSearchQuerySuccessResolvers = {
  teamMember: ({teamId, userId}, _args, {dataLoader}) =>
    dataLoader.get('teamMembers').loadNonNull(toTeamMemberId(teamId, userId))
}

export default RemoveIntegrationSearchQuerySuccess
