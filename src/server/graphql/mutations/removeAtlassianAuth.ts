import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import RemoveAtlassianAuthPayload from 'server/graphql/types/RemoveAtlassianAuthPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import standardError from 'server/utils/standardError'
import {TEAM} from 'universal/utils/constants'

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
    const r = getRethink()
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

    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    const authId = existingAuth.id
    await r
      .table('AtlassianAuth')
      .get(authId)
      .update({accessToken: null, refreshToken: null, updatedAt: now})

    const data = {authId, teamId}
    publish(TEAM, teamId, RemoveAtlassianAuthPayload, data, subOptions)
    return data
  }
}
