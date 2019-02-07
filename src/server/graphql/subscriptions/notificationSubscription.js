import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import NotificationSubscriptionPayload from 'server/graphql/types/NotificationSubscriptionPayload'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import {NOTIFICATION} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

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
