import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AuthToken from '../../database/types/AuthToken'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import encodeAuthToken from '../../utils/encodeAuthToken'
import getPubSub from '../../utils/getPubSub'
import standardError from '../../utils/standardError'
import NotificationSubscriptionPayload from '../types/NotificationSubscriptionPayload'

export default {
  type: new GraphQLNonNull(NotificationSubscriptionPayload),
  subscribe: (_source, _args, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.NOTIFICATION}.${viewerId}`
    const pubSub = getPubSub()
    const transform = (value: any) => {
      if (value.mutatorId === socketId) return undefined
      if (value.operationId) {
        dataLoader.useShared(value.operationId)
      }
      const data =
        value.data.type === 'AuthTokenPayload'
          ? {
              type: value.data.type,
              id: encodeAuthToken(new AuthToken({...authToken, ...value.data}))
            }
          : value.data

      return {notificationSubscription: data}
    }

    const onCompleted = () => {
      dataLoader.dispose({force: true})
    }

    return pubSub.subscribe([channelName], transform, {onCompleted})
  }
}
