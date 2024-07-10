import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import getPubSub from '../../../utils/getPubSub'
import {SubscriptionContext} from '../../graphql'
import {SubscriptionResolvers} from '../resolverTypes'

const organizationSubscription: SubscriptionResolvers<SubscriptionContext>['organizationSubscription'] =
  {
    subscribe: async (_source, _args, {authToken}) => {
      // AUTH
      const viewerId = getUserId(authToken)
      const r = await getRethink()
      const organizationUsers = await r
        .table('OrganizationUser')
        .getAll(viewerId, {index: 'userId'})
        .filter({removedAt: null})
        .run()
      const orgIds = organizationUsers.map(({orgId}) => orgId)

      // RESOLUTION
      const channelNames = orgIds
        .concat(viewerId)
        .map((id) => `${SubscriptionChannel.ORGANIZATION}.${id}`)
      return getPubSub().subscribe(channelNames)
    }
  }
export default organizationSubscription
