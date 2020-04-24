import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import RemoveAtlassianAuthPayload from '../types/RemoveAtlassianAuthPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

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
  resolve: async (_source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)
    const now = new Date()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const existingAuth = await r
      .table('AtlassianAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)
      .run()

    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    const authId = existingAuth.id
    await r
      .table('AtlassianAuth')
      .get(authId)
      .update({accessToken: null, refreshToken: null, isActive: false, updatedAt: now})
      .run()

    const data = {authId, teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveAtlassianAuthPayload', data, subOptions)
    return data
  }
}
