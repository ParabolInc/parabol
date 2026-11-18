import type {JoinTeamPayloadResolvers} from '../resolverTypes'

export type JoinTeamPayloadSource = {
  teamId: string
  teamMemberId: string
}

const JoinTeamPayload: JoinTeamPayloadResolvers = {
  viewer: async (_source, _args, {authToken, dataLoader}) => {
    return dataLoader.get('users').loadNonNull(authToken.sub)
  },
  team: async ({teamId}, _args, {authToken, dataLoader}) => {
    return dataLoader.get('teamsWithUserSort').loadNonNull({teamId, userId: authToken.sub})
  },
  teamMember: async ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  }
}

export default JoinTeamPayload
