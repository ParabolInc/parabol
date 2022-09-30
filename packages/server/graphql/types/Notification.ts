import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import NotificationEnum from './NotificationEnum'
import NotificationStatusEnum from './NotificationStatusEnum'
import PageInfoDateCursor from './PageInfoDateCursor'

export const notificationInterfaceFields = {
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'A shortid for the notification'
  },
  status: {
    type: new GraphQLNonNull(NotificationStatusEnum),
    description: 'UNREAD if new, READ if viewer has seen it, CLICKED if viewed clicked it'
  },
  // orgId: {
  //   type: GraphQLID,
  //   description:
  //     '*The unique organization ID for this notification. Can be blank for targeted notifications'
  // },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The datetime to activate the notification & send it to the client'
  },
  type: {
    type: new GraphQLNonNull(NotificationEnum)
  },
  userId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '*The userId that should see this notification'
  }
}

const Notification: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'Notification',
  fields: () => notificationInterfaceFields
})

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Notification,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const NotificationConnection = connectionType
export const NotificationEdge = edgeType
export default Notification
