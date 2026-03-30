import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {broadcastSubscription} from '../broadcastSubscription'
import type {SubscriptionResolvers} from '../resolverTypes'

const teamSubscription: SubscriptionResolvers['teamSubscription'] = {
  subscribe: async (_source, _args, context) => {
    const {authToken, dataLoader} = context
    // AUTH
    if (!isAuthenticated(authToken)) {
      throw new Error('Not authenticated')
    }
    // RESOLUTION
    const viewerId = getUserId(authToken)
    const teamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)
    const teamIds = teamMembers.map((tm) => tm.teamId)
    const channelNames = teamIds.map((id) => `${SubscriptionChannel.TEAM}.${id}`)
    const iter = await getPubSub().subscribe(channelNames)
    return broadcastSubscription(iter, context)
  }
}
export default teamSubscription
