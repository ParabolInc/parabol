import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {GQLContext} from 'server/graphql/graphql'
import fetchAllIntegrations from 'server/graphql/queries/helpers/fetchAllIntegrations'
import {
  getPermsByTaskService,
  getTeamIntegrationsByUserId,
  useOnlyUserIntegrations
} from 'server/graphql/queries/helpers/suggestedIntegrationHelpers'
import SuggestedIntegration from 'server/graphql/types/SuggestedIntegration'
import {getUserId} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'
import {ISuggestedIntegrationsOnUserArguments} from 'universal/types/graphql'

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SuggestedIntegration))),
  args: {
    teamId: {
      type: GraphQLID,
      description: 'a teamId to use as a filter to provide more accurate suggestions'
    },
    userId: {
      type: GraphQLID,
      description: 'The id for the user the task is for'
    }
  },
  resolve: async (
    _source: any,
    {teamId, userId}: ISuggestedIntegrationsOnUserArguments,
    {authToken, dataLoader}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const filterUserId = userId || viewerId

    // AUTH
    if (userId && userId !== viewerId) {
      const user = await dataLoader.get('users').load(userId)
      const {tms} = user
      const onTeam = authToken.tms.find((teamId) => tms.includes(teamId))
      if (!onTeam) {
        return standardError(new Error('Not on same team as user'), {userId: viewerId})
      }
    }
    if (teamId) {
      const teamIntegrationsByUserId = await getTeamIntegrationsByUserId(teamId)

      // if the team has no integrations, return every possible integration for the user
      if (!teamIntegrationsByUserId.length) {
        return fetchAllIntegrations(dataLoader, teamId, filterUserId)
      }
      const userIntegrationsForTeam = useOnlyUserIntegrations(
        teamIntegrationsByUserId,
        filterUserId
      )
      if (userIntegrationsForTeam) return userIntegrationsForTeam

      const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)

      const aMonthAgo = new Date(Date.now() - ms('30d'))
      const recentUserIntegrations = teamIntegrationsByUserId.filter(
        (integration) => integration.userId === filterUserId && integration.lastUsedAt >= aMonthAgo
      )
      const teamIntegrationsWithUserPerms = teamIntegrationsByUserId.filter((integration) => {
        return integration.userId !== filterUserId && permLookup[integration.service]
      })
      return [...recentUserIntegrations, ...teamIntegrationsWithUserPerms]
    }
  }
}
