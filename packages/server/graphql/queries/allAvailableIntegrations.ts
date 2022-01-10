import {GraphQLList, GraphQLNonNull} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import RepoIntegration from '../types/RepoIntegration'
import fetchAllIntegrations from './helpers/fetchAllIntegrations'

export default {
  description: 'All the integrations that the user could possibly use',
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RepoIntegration))),
  resolve: async ({teamId, userId}, _args: unknown, context: GQLContext, info) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').load(userId)
      const {tms} = user
      const onTeam = authToken.tms.find((teamId) => tms!.includes(teamId))
      if (!onTeam) {
        return []
      }
    }
    return fetchAllIntegrations(dataLoader, teamId, userId, context, info)
  }
}
