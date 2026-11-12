import {getUserId} from '../../../utils/authorization'
import type {JoinTeamSuccessResolvers} from '../resolverTypes'

export type JoinTeamSuccessSource = {
  teamId: string
  teamMemberId: string
}

const JoinTeamSuccess: JoinTeamSuccessResolvers = {
  viewer: async (_source, _args, {authToken, dataLoader}) => {
    return dataLoader.get('users').loadNonNull(getUserId(authToken))
  },
  team: async ({teamId}, _args, {authToken, dataLoader}) => {
    return dataLoader.get('teamsWithUserSort').loadNonNull({teamId, userId: getUserId(authToken)})
  },
  teamMember: async ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default JoinTeamSuccess
