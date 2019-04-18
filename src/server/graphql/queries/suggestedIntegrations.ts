import {GraphQLID, GraphQLNonNull} from 'graphql'
import ms from 'ms'
import {GQLContext} from 'server/graphql/graphql'
import fetchAllIntegrations from 'server/graphql/queries/helpers/fetchAllIntegrations'
import {
  getPermsByTaskService,
  getTeamIntegrationsByUserId,
  IntegrationByUserId,
  useOnlyUserIntegrations
} from 'server/graphql/queries/helpers/suggestedIntegrationHelpers'
import SuggestedIntegrationQueryPayload from 'server/graphql/types/SuggestedIntegrationQueryPayload'
import {getUserId} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'
import {ISuggestedIntegrationsOnUserArguments, IUser} from 'universal/types/graphql'

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(SuggestedIntegrationQueryPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'a teamId to use as a filter to provide more accurate suggestions'
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
        return standardError(new Error('Not on same team as user'), {userId: viewerId})
      }
    }
    const teamIntegrationsByUserId = await getTeamIntegrationsByUserId(teamId)

    // if the team has no integrations, return every possible integration for the user
    if (!teamIntegrationsByUserId.length) {
      const items = await fetchAllIntegrations(dataLoader, teamId, userId)
      return {items, hasMore: false}
    }
    const userIntegrationsForTeam = useOnlyUserIntegrations(teamIntegrationsByUserId, userId)
    if (userIntegrationsForTeam) {
      return {items: userIntegrationsForTeam, hasMore: true}
    }

    const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)

    const aMonthAgo = new Date(Date.now() - ms('30d'))
    const recentUserIntegrations = teamIntegrationsByUserId.filter(
      (integration) => integration.userId === userId && integration.lastUsedAt >= aMonthAgo
    )

    const idSet = new Set()
    const dedupedTeamIntegrations = [] as IntegrationByUserId[]
    for (let i = 0; i < teamIntegrationsByUserId.length; i++) {
      const integration = teamIntegrationsByUserId[i]
      if (
        integration.userId === userId ||
        !permLookup[integration.service] ||
        idSet.has(integration.id)
      ) {
        continue
      }
      idSet.add(integration.id)
      dedupedTeamIntegrations.push(integration)
    }

    const userAndTeamItems = [...recentUserIntegrations, ...dedupedTeamIntegrations]

    // if other users have items that the viewer can't access, revert back to fetching everything
    if (userAndTeamItems.length === 0) {
      const items = await fetchAllIntegrations(dataLoader, teamId, userId)
      return {items, hasMore: false}
    }
    return {hasMore: true, items: userAndTeamItems}
  }
}
