import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import SlackNotificationEventEnum from 'server/graphql/types/SlackNotificationEventEnum'
import SlackNotificationEventTypeEnum from 'server/graphql/types/SlackNotificationEventTypeEnum'
import {slackNotificationEventTypeLookup} from 'server/database/types/SlackNotification'

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
    eventType: {
      type: new GraphQLNonNull(SlackNotificationEventTypeEnum),
      resolve: ({event}) => {
        return slackNotificationEventTypeLookup[event]
      }
    },
    channelId: {
      type: GraphQLID,
      description: 'null if no notification is to be sent'
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
