import {GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {requireSU} from '../../../utils/authorization'
import MessageAllSlackUsersPayload from '../types/MessageAllSlackUsersPayload'
import {GQLContext} from '../../graphql'
import SlackServerManager from '../../../utils/SlackServerManager'
import standardError from '../../../utils/standardError'

interface MessageSlackUserError {
  userId: string
  error: string
}

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
    const allSlackAuths = await r.table('SlackAuth').filter({isActive: true}).run()
    if (!allSlackAuths || !allSlackAuths.length) {
      return standardError(new Error('No authorised Slack users'))
    }

    const messagedUserIds = [] as string[]
    const errors = [] as MessageSlackUserError[]
    for (const slackAuth of allSlackAuths) {
      const {botAccessToken, defaultTeamChannelId, userId} = slackAuth
      const manager = new SlackServerManager(botAccessToken)
      const postMessageRes = await manager.postMessage(defaultTeamChannelId, message)
      if (!postMessageRes.ok) {
        errors.push({
          userId,
          error: postMessageRes.error
        })
      } else {
        messagedUserIds.push(userId)
      }
    }

    const data = {messagedUserIds, errors}
    return data
  }
}

export default messageAllSlackUsers
