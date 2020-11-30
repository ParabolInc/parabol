import {GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {requireSU} from '../../utils/authorization'
import MessageAllSlackUsersPayload from '../types/MessageAllSlackUsersPayload'
import {GQLContext} from '../graphql'
import SlackServerManager from '../../utils/SlackServerManager'
import standardError from '../../utils/standardError'

const messageAllSlackUsers = {
  type: GraphQLNonNull(MessageAllSlackUsersPayload),
  description: 'Send a message to all authorised Slack users',
  args: {
    message: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The slack message that will be sent to all Slack users'
    }
  },
  resolve: async (_source, {message}, {authToken}: GQLContext) => {
    const r = await getRethink()

    //AUTH
    requireSU(authToken)

    // RESOLUTION
    const allSlackAuths = await r
      .table('SlackAuth')
      .filter({isActive: true})
      .run()
    if (!allSlackAuths || !allSlackAuths.length) {
      return standardError(new Error('No authorised Slack users'))
    }

    const messagedUserIds = [] as string[]
    for (const slackAuth of allSlackAuths) {
      const {botAccessToken, slackUserId, userId} = slackAuth
      const manager = new SlackServerManager(botAccessToken)
      const openDMRes = await manager.openDM(slackUserId)
      if (!openDMRes.ok) {
        return standardError(new Error(openDMRes.error), {userId})
      }
      const channelId = openDMRes.channel.id
      const postMessageRes = await manager.postMessage(channelId, message)
      if (!postMessageRes.ok) {
        return standardError(new Error(postMessageRes.error), {userId})
      }
      messagedUserIds.push(userId)
    }

    const data = {messagedUserIds}
    return data
  }
}

export default messageAllSlackUsers
