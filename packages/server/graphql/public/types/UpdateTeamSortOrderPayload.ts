import {UpdateTeamSortOrderPayloadResolvers} from '../resolverTypes'

export type UpdateTeamSortOrderPayloadSource = {teamId: string}

const UpdateTeamSortOrderPayload: UpdateTeamSortOrderPayloadResolvers = {
  team: ({teamId}, _args, {authToken, dataLoader}) => {
    return dataLoader.get('teamsWithUserSort').loadNonNull({teamId, userId: authToken.sub})
  },
  user: async (_source, _args, {authToken, dataLoader}) => {
    return dataLoader.get('users').loadNonNull(authToken.sub)
  }
}

export default UpdateTeamSortOrderPayload
