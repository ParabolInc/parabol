import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import type {AddedNotificationResolvers} from '../resolverTypes'

export type AddedNotificationSource = {addedNotificationId: string}

const AddedNotification: AddedNotificationResolvers = {
  addedNotification: async ({addedNotificationId}, _args: unknown, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const notification = await dataLoader.get('notifications').loadNonNull(addedNotificationId)
    if (notification.userId !== viewerId) {
      throw new GraphQLError(`Notification ${addedNotificationId} was published to another user`, {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    }

    return notification
  }
}

export default AddedNotification
