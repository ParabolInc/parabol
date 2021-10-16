import {GraphQLID, GraphQLNonNull} from 'graphql'
import RemoveMattermostAuthPayload from '../types/RemoveMattermostAuthPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getMattermostAuthByTeamId from '../../postgres/queries/getMattermostAuthByTeamId'
import removeMattermostAuth from '../../postgres/queries/removeMattermostAuth'

export default {
  name: 'RemoveMattermostAuth',
  type: new GraphQLNonNull(RemoveMattermostAuthPayload),
  description: 'Disconnect a team member from Slack',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the teamId to disconnect from Mattermost'
    }
  },
  resolve: async (_source, {teamId}, {authToken, socketId: mutatorId, dataLoader}) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const existingAuth = await getMattermostAuthByTeamId(teamId)
    if (!existingAuth) {
      return standardError(new Error('Auth not found'), {userId: viewerId})
    }
    await removeMattermostAuth(teamId)

    const data = {teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveMattermostAuthPayload', data, subOptions)
    return data
  }
}
