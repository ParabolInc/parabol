import {GraphQLID, GraphQLNonNull} from 'graphql'
import {fromGlobalId} from 'graphql-relay'
import getRethink from 'server/database/rethinkDriver'
import RemoveSlackChannelPayload from 'server/graphql/types/RemoveSlackChannelPayload'
import getPubSub from 'server/utils/getPubSub'
import {SLACK} from 'universal/utils/constants'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import standardError from 'server/utils/standardError'

export default {
  name: 'RemoveSlackChannel',
  description: 'Remove a slack channel integration from a team',
  type: new GraphQLNonNull(RemoveSlackChannelPayload),
  args: {
    slackGlobalId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {slackGlobalId}, {authToken, socketId: mutatorId}) => {
    const r = getRethink()
    const {id} = fromGlobalId(slackGlobalId)
    const viewerId = getUserId(authToken)
    // AUTH
    const integration = await r.table(SLACK).get(id)
    if (!integration) {
      return standardError(new Error('Slack provider not found'), {userId: viewerId})
    }
    const {teamId, isActive} = integration
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    if (!isActive) {
      return standardError(new Error('Integration already removed'), {userId: viewerId})
    }
    // RESOLUTION

    await r
      .table(SLACK)
      .get(id)
      .update({
        isActive: false
      })
    const slackChannelRemoved = {
      deletedId: slackGlobalId
    }
    getPubSub().publish(`slackChannelRemoved.${teamId}`, {
      slackChannelRemoved,
      mutatorId
    })
    return slackChannelRemoved
  }
}
