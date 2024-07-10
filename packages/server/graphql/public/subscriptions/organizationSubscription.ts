import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {SubscriptionResolvers} from '../resolverTypes'

const organizationSubscription: SubscriptionResolvers['organizationSubscription'] = {
  subscribe: async (_source, _args, {authToken, dataLoader}) => {
    // AUTH
    const viewerId = getUserId(authToken)

    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const orgIds = organizationUsers.map(({orgId}) => orgId)

    // RESOLUTION
    const channelNames = orgIds
      .concat(viewerId)
      .map((id) => `${SubscriptionChannel.ORGANIZATION}.${id}`)
    return getPubSub().subscribe(channelNames)
  }
}
export default organizationSubscription
