import {GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import SuggestedIntegrationQueryPayload from '../types/SuggestedIntegrationQueryPayload'
import fetchAllIntegrations from './helpers/fetchAllIntegrations'
import {
  getPermsByTaskService,
  getTeamIntegrationsByTeamId,
  useOnlyUserIntegrations
} from './helpers/suggestedIntegrationHelpers'

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(SuggestedIntegrationQueryPayload),
  resolve: async (
    {teamId, userId}: {teamId: string; userId: string},
    _args: unknown,
    context: GQLContext,
    info: GraphQLResolveInfo
  ) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)

    // AUTH
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').load(userId)
      const {tms} = user!
      const onTeam = authToken.tms.find((teamId) => tms!.includes(teamId))
      if (!onTeam) {
        return standardError(new Error('Not on same team as user'), {userId: viewerId})
      }
    }
    const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)
    const teamIntegrationsByTeamId = await getTeamIntegrationsByTeamId(teamId, permLookup)
    const userIntegrationIdsForTeam =
      (await useOnlyUserIntegrations(teamIntegrationsByTeamId, userId))?.map(({id}) => id) || []
    // const recentIntegrationIds = Array.from(
    //   new Set([...userIntegrationsForTeam, ...teamIntegrationsByTeamId].map(({id}) => id))
    // )
    // const testa = await fetchAllIntegrations(
    //   dataLoader,
    //   teamId,
    //   userId,
    //   // recentIntegrationIds,
    //   context,
    //   info
    // )
    // console.log('🚀  ~ sug int--', {teamIntegrationsByTeamId, userIntegrationsForTeam})
    // return {items: testa, hasMore: false}

    // console.log('🚀  ~ teamIntegrationsByTeamId', teamIntegrationsByTeamId)

    // if the team has no integrations, return every possible integration for the user
    // if (!teamIntegrationsByTeamId.length) {
    //   const items = await fetchAllIntegrations(dataLoader, teamId, userId, context, info)
    //   console.log('🚀  ~ sug int 1', {items})
    //   return {items, hasMore: false}
    // }
    // // const userIntegrationsForTeam = useOnlyUserIntegrations(teamIntegrationsByTeamId, userId)
    // if (userIntegrationsForTeam) {
    //   console.log('🚀  ~ sug int 2', {userIntegrationsForTeam})
    //   return {items: userIntegrationsForTeam, hasMore: true}
    // }

    const allIntegrations = await fetchAllIntegrations(dataLoader, teamId, userId, context, info)
    const orderedIntegrations: any = []
    const idSet = new Set()
    allIntegrations.forEach((integration) => {
      if (idSet.has(integration.id)) return
      idSet.add(integration.id)
      return userIntegrationIdsForTeam.includes(integration.id)
        ? orderedIntegrations.unshift(integration)
        : orderedIntegrations.push(integration)
    })

    // console.log('🚀  ~ ------', {
    //   recentUserIntegrations,
    //   teamIntegrationsByTeamId,
    //   userIntegrationIdsForTeam,
    //   orderedIntegrations
    // })
    return {hasMore: false, items: [...orderedIntegrations, userId, teamId, cloudId]}
    // return {items: orderedIntegrations, hasMore: false}

    // if other users have items that the viewer can't access, revert back to fetching everything
    // if (userAndTeamItems.length === 0) {
    // const items = await fetchAllIntegrations(dataLoader, teamId, userId, context, info)
    // return {items, hasMore: false}
    // }
    // console.log('🚀  ~ suggested int 3...', {dedupedTeamIntegrations})
    // return {hasMore: true, items: dedupedTeamIntegrations}
  }
}
