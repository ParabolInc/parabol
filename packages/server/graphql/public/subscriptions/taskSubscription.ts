import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {broadcastSubscription} from '../broadcastSubscription'
import {SubscriptionResolvers} from '../resolverTypes'

const taskSubscription: SubscriptionResolvers['taskSubscription'] = {
  subscribe: async (_source, _args, {authToken, socketId}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      throw new Error('Not authenticated')
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.TASK}.${viewerId}`
    const iter = getPubSub().subscribe([channelName])
    return broadcastSubscription(iter, socketId)
  }
}

export default taskSubscription
