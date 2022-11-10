import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import Notification from './Notification'
import StandardMutationError from './StandardMutationError'

const SetNotificationStatusPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SetNotificationStatusPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    notification: {
      type: Notification,
      description: 'The updated notification',
      resolve: ({notificationId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('notifications').load(notificationId)
      }
    }
  })
})

export default SetNotificationStatusPayload
