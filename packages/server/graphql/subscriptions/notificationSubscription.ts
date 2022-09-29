import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import getPubSub from '../../utils/getPubSub'
import NotificationSubscriptionPayload from '../types/NotificationSubscriptionPayload'
import {GQLContext} from './../graphql'

export default {
  type: new GraphQLNonNull(NotificationSubscriptionPayload),
  subscribe: (_source: unknown, _args: unknown, {authToken}: GQLContext) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      throw new Error('Not authenticated')
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.NOTIFICATION}.${viewerId}`

    return getPubSub().subscribe([channelName])
  }
}
