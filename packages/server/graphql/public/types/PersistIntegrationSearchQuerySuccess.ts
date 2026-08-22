import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import type {PersistIntegrationSearchQuerySuccessResolvers} from '../resolverTypes'

export type PersistIntegrationSearchQuerySuccessSource = {
  teamId: string
  userId: string
}

const PersistIntegrationSearchQuerySuccess: PersistIntegrationSearchQuerySuccessResolvers = {
  teamMember: ({teamId, userId}, _args, {dataLoader}) =>
    dataLoader.get('teamMembers').loadNonNull(toTeamMemberId(teamId, userId))
}

export default PersistIntegrationSearchQuerySuccess
