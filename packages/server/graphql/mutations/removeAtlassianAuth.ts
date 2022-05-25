import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getAtlassianAuthByUserIdTeamId from '../../postgres/queries/getAtlassianAuthByUserIdTeamId'
import removeAtlassianAuth from '../../postgres/queries/removeAtlassianAuth'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemoveAtlassianAuthPayload from '../types/RemoveAtlassianAuthPayload'

export default {
  name: 'RemoveAtlassianAuth',
  type: new GraphQLNonNull(RemoveAtlassianAuthPayload),
  description: 'Disconnect a team member from atlassian',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the teamId to disconnect from the token'
    }
  },
  resolve: async (
    _source: unknown,
    {teamId}: {teamId: string},
    {authToken, socketId: mutatorId, dataLoader}: GQLContext
  ) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const existingAuth = await getAtlassianAuthByUserIdTeamId(viewerId, teamId)
    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    await removeAtlassianAuth(viewerId, teamId)
    analytics.integrationRemoved(viewerId, teamId, 'jira')

    const data = {teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveAtlassianAuthPayload', data, subOptions)
    return data
  }
}
