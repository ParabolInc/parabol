import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../../graphql'
import makeMutationPayload from '../../types/makeMutationPayload'
import MessageSlackUserError from '../../types/MessageSlackUserError'

export const MessageAllSlackUsersSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'MessageAllSlackUsersSuccess',
  fields: () => ({
    messagedUserIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'A list of the Parabol user ids that have been sent a direct message in Slack'
    },
    errors: {
      type: new GraphQLList(new GraphQLNonNull(MessageSlackUserError)),
      description: 'Slack messages that failed to send'
    }
  })
})

const MessageAllSlackUsersPayload = makeMutationPayload(
  'MessageAllSlackUsersPayload',
  MessageAllSlackUsersSuccess
)

export default MessageAllSlackUsersPayload
