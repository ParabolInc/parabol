import {GraphQLNonNull, GraphQLResolveInfo} from 'graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RepoIntegrationQueryPayload from '../types/RepoIntegrationQueryPayload'
import fetchAllRepoIntegrations from './helpers/fetchAllRepoIntegrations'

export default {
  description: 'The integrations that the user would probably like to use',
  type: new GraphQLNonNull(RepoIntegrationQueryPayload),
  resolve: async (
    {teamId, userId}: {teamId: string; userId: string},
    {first = 10}: {first?: number},
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

    // RESOLUTION
    const allRepoIntegrations = await fetchAllRepoIntegrations(teamId, userId, context, info)

    if (allRepoIntegrations.length > first) {
      return {hasMore: true, items: allRepoIntegrations.slice(0, first)}
    } else {
      return {hasMore: false, items: allRepoIntegrations}
    }
  }
}
