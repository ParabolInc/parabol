import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import getPubSub from '../../utils/getPubSub'
import standardError from '../../utils/standardError'
import NotificationSubscriptionPayload from '../types/NotificationSubscriptionPayload'

export default {
  type: new GraphQLNonNull(NotificationSubscriptionPayload),
  subscribe: (_source, _args, {authToken}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.NOTIFICATION}.${viewerId}`

    return getPubSub().subscribe([channelName])
  }
}
