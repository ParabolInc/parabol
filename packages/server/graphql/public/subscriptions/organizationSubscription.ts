import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {SubscriptionContext} from '../../graphql'
import {SubscriptionResolvers} from '../resolverTypes'

const organizationSubscription: SubscriptionResolvers<SubscriptionContext>['organizationSubscription'] =
  {
    subscribe: async (_source, _args, {authToken}) => {
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
      return getPubSub().subscribe(channelNames)
    }
  }
export default organizationSubscription
