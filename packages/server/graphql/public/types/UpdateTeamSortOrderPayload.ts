import {getUserId} from '../../../utils/authorization'
import type {UpdateTeamSortOrderPayloadResolvers} from '../resolverTypes'

export type UpdateTeamSortOrderPayloadSource = {teamId: string}

const UpdateTeamSortOrderPayload: UpdateTeamSortOrderPayloadResolvers = {
  team: ({teamId}, _args, {authToken, dataLoader}) => {
    return dataLoader.get('teamsWithUserSort').loadNonNull({teamId, userId: getUserId(authToken)})
  },
  user: async (_source, _args, {authToken, dataLoader}) => {
    return dataLoader.get('users').loadNonNull(getUserId(authToken))
  }
}

export default UpdateTeamSortOrderPayload
