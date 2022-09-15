import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {
  SlackNotificationEvent,
  slackNotificationEventTypeLookup
} from '../../database/types/SlackNotification'
import {GQLContext} from '../graphql'
import SlackNotificationEventEnum from './SlackNotificationEventEnum'
import SlackNotificationEventTypeEnum from './SlackNotificationEventTypeEnum'

const SlackNotification = new GraphQLObjectType<any, GQLContext>({
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
      resolve: ({event}: {event: SlackNotificationEvent}) => {
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
