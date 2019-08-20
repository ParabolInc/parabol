import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from '../makeSubscribeIter'
import NotificationSubscriptionPayload from '../types/NotificationSubscriptionPayload'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AuthToken from '../../database/types/AuthToken'
import encodeAuthToken from '../../utils/encodeAuthToken'

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
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => {
      // we have to do this here so we get access to the recipient's auth token
      if (data.type === 'AuthTokenPayload') {
        return {notificationSubscription: {type: data.type, id: encodeAuthToken(new AuthToken({...authToken, ...data}))}}
      }
      return {notificationSubscription: data}
    }
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}
