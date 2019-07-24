import {GraphQLObjectType} from 'graphql'
import Notification from './Notification'
import StandardMutationError from './StandardMutationError'

const ClearNotificationPayload = new GraphQLObjectType({
  name: 'ClearNotificationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    notification: {
      type: Notification,
      description: 'The deleted notifcation'
    }
  })
})

export default ClearNotificationPayload
