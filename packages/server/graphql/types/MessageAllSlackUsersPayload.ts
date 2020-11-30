import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const MessageAllSlackUsersSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'MessageAllSlackUsersSuccess',
  fields: () => ({
    messagedUserIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'A list of the Parabol user ids that have been sent a direct message in Slack'
    }
  })
})

const MessageAllSlackUsersPayload = makeMutationPayload(
  'MessageAllSlackUsersPayload',
  MessageAllSlackUsersSuccess
)

export default MessageAllSlackUsersPayload
