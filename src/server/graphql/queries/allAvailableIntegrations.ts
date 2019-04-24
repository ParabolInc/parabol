import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {GQLContext} from 'server/graphql/graphql'
import fetchAllIntegrations from 'server/graphql/queries/helpers/fetchAllIntegrations'
import SuggestedIntegration from 'server/graphql/types/SuggestedIntegration'
import {getUserId} from 'server/utils/authorization'
import {ISuggestedIntegrationsOnUserArguments, IUser} from 'universal/types/graphql'

export default {
  description: 'All the integrations that the user could possibly use',
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SuggestedIntegration))),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'a teamId to use as a filter for the access tokens'
    }
  },
  resolve: async (
    {id: userId}: IUser,
    {teamId}: ISuggestedIntegrationsOnUserArguments,
    {authToken, dataLoader}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)

    // AUTH
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').load(userId)
      const {tms} = user
      const onTeam = authToken.tms.find((teamId) => tms.includes(teamId))
      if (!onTeam) {
        return []
      }
    }
    return fetchAllIntegrations(dataLoader, teamId, userId)
  }
}
