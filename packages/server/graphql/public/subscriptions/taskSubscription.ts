import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {broadcastSubscription} from '../broadcastSubscription'
import type {SubscriptionResolvers} from '../resolverTypes'

const taskSubscription: SubscriptionResolvers['taskSubscription'] = {
  subscribe: async (_source, _args, context) => {
    const {authToken} = context
    // AUTH
    if (!isAuthenticated(authToken)) {
      throw new Error('Not authenticated')
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.TASK}.${viewerId}`
    const iter = await getPubSub().subscribe([channelName])
    return broadcastSubscription(iter, context)
  }
}

export default taskSubscription
