import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import RemoveSlackAuthPayload from 'server/graphql/types/RemoveSlackAuthPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import standardError from 'server/utils/standardError'
import {TEAM} from 'universal/utils/constants'

export default {
  name: 'RemoveSlackAuth',
  type: new GraphQLNonNull(RemoveSlackAuthPayload),
  description: 'Disconnect a team member from Slack',
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
      .table('SlackAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)

    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    const authId = existingAuth.id
    await r
      .table('SlackAuth')
      .get(authId)
      .update({accessToken: null, isActive: false, updatedAt: now})

    const data = {authId, teamId, userId: viewerId}
    publish(TEAM, teamId, RemoveSlackAuthPayload, data, subOptions)
    return data
  }
}
