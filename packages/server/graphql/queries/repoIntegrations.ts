import {GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RepoIntegrationQueryPayload from '../types/RepoIntegrationQueryPayload'
import fetchAllIntegrations from './helpers/fetchAllIntegrations'
import {
  getPermsByTaskService,
  getTeamIntegrationsByTeamId,
  useOnlyUserIntegrations
} from './helpers/repoIntegrationHelpers'

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(RepoIntegrationQueryPayload),
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
    const allIntegrations = (await fetchAllIntegrations(
      dataLoader,
      teamId,
      userId,
      context,
      info
    )) as any[]
    const orderedIntegrations: any = []
    const idSet = new Set()
    allIntegrations.forEach((integration) => {
      if (idSet.has(integration.id)) return
      idSet.add(integration.id)
      userIntegrationIdsForTeam.includes(integration.id)
        ? orderedIntegrations.unshift(integration)
        : orderedIntegrations.push(integration)
    })

    const first = 10
    if (orderedIntegrations.length > first) {
      return {hasMore: true, items: orderedIntegrations.slice(0, first)}
    } else {
      return {hasMore: false, items: orderedIntegrations}
    }
  }
}
