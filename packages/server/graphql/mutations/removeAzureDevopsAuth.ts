import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import RemoveAzureDevopsAuthPayload from '../types/RemoveAzureDevopsAuthPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {TEAM} from 'parabol-client/utils/constants'

export default {
  name: 'RemoveAzureDevopsAuth',
  type: new GraphQLNonNull(RemoveAzureDevopsAuthPayload),
  description: 'Disconnect a team member from Azure Devops',
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
      .table('AzureDevopsAuth')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .nth(0)
      .default(null)

    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }

    const authId = existingAuth.id
    await r
      .table('AzureDevopsAuth')
      .get(authId)
      .update({accessToken: null, refreshToken: null, isActive: false, updatedAt: now})

    const data = {authId, teamId, userId: viewerId}
    publish(TEAM, teamId, RemoveAzureDevopsAuthPayload, data, subOptions)
    return data
  }
}
