import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import SlackNotificationEventEnum from 'server/graphql/types/SlackNotificationEventEnum'

const SlackNotification = new GraphQLObjectType({
  name: 'SlackNotification',
  description: 'an event trigger and slack channel to receive it',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    event: {
      type: new GraphQLNonNull(SlackNotificationEventEnum)
    },
    channelId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default SlackNotification
