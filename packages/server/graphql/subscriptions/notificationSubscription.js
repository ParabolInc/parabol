import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from '../makeSubscribeIter'
import NotificationSubscriptionPayload from '../types/NotificationSubscriptionPayload'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import {NOTIFICATION} from '../../../client/utils/constants'
import standardError from '../../utils/standardError'

export default {
  type: new GraphQLNonNull(NotificationSubscriptionPayload),
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${NOTIFICATION}.${viewerId}`
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({notificationSubscription: data})
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}
