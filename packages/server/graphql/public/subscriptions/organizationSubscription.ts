import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {broadcastSubscription} from '../broadcastSubscription'
import {SubscriptionResolvers} from '../resolverTypes'

const organizationSubscription: SubscriptionResolvers['organizationSubscription'] = {
  subscribe: async (_source, _args, context) => {
    const {authToken} = context
    // AUTH
    const viewerId = getUserId(authToken)
    const pg = getKysely()

    const organizationUsers = await pg
      .selectFrom('OrganizationUser')
      .select('orgId')
      .where('userId', '=', viewerId)
      .where('removedAt', 'is', null)
      .execute()
    const orgIds = organizationUsers.map(({orgId}) => orgId)

    // RESOLUTION
    const channelNames = orgIds
      .concat(viewerId)
      .map((id) => `${SubscriptionChannel.ORGANIZATION}.${id}`)
    const iter = getPubSub().subscribe(channelNames)
    return broadcastSubscription(iter, context)
  }
}
export default organizationSubscription
