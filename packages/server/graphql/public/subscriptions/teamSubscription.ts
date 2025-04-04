import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {broadcastSubscription} from '../broadcastSubscription'
import {SubscriptionResolvers} from '../resolverTypes'

const teamSubscription: SubscriptionResolvers['teamSubscription'] = {
  subscribe: async (_source, _args, context) => {
    const {authToken} = context
    // AUTH
    if (!isAuthenticated(authToken)) {
      throw new Error('Not authenticated')
    }
    // RESOLUTION
    const userId = getUserId(authToken)
    const {tms: teamIds} = authToken
    const channelNames = teamIds.concat(userId).map((id) => `${SubscriptionChannel.TEAM}.${id}`)
    const iter = getPubSub().subscribe(channelNames)
    return broadcastSubscription(iter, context)
  }
}
export default teamSubscription
