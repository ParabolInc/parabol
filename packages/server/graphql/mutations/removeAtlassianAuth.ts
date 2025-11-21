import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {selectAtlassianAuth} from '../../postgres/select'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import type {GQLContext} from '../graphql'
import updateRepoIntegrationsCacheByPerms from '../queries/helpers/updateRepoIntegrationsCacheByPerms'
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
    const pg = getKysely()
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const [existingAuth, viewer] = await Promise.all([
      selectAtlassianAuth()
        .where('userId', '=', viewerId)
        .where('teamId', '=', teamId)
        .where('isActive', '=', true)
        .executeTakeFirst(),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    await pg
      .updateTable('AtlassianAuth')
      .set({isActive: false})
      .where('userId', '=', viewerId)
      .where('teamId', '=', teamId)
      .where('isActive', '=', true)
      .execute()

    updateRepoIntegrationsCacheByPerms(dataLoader, viewerId, teamId, false)
    analytics.integrationRemoved(viewer, teamId, 'jira')

    const data = {teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveAtlassianAuthPayload', data, subOptions)
    return data
  }
}
