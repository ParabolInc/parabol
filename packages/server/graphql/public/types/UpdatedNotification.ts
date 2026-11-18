import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import type {UpdatedNotificationResolvers} from '../resolverTypes'

export type UpdatedNotificationSource = {updatedNotificationId: string}

const UpdatedNotification: UpdatedNotificationResolvers = {
  updatedNotification: async ({updatedNotificationId}, _args: unknown, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const notification = await dataLoader.get('notifications').loadNonNull(updatedNotificationId)
    if (notification.userId !== viewerId) {
      throw new GraphQLError(
        `Notification ${updatedNotificationId} was published to another user`,
        {extensions: {code: 'INTERNAL_SERVER_ERROR'}}
      )
    }

    return notification
  }
}

export default UpdatedNotification
