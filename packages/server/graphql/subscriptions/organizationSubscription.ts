import {GQLContext} from './../graphql'
import getRethink from '../../database/rethinkDriver'
import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getPubSub from '../../utils/getPubSub'
import {getUserId} from '../../utils/authorization'
import OrganizationSubscriptionPayload from '../types/OrganizationSubscriptionPayload'

export default {
  type: new GraphQLNonNull(OrganizationSubscriptionPayload),
  subscribe: async (_source: unknown, _args: unknown, {authToken, socketId}: GQLContext) => {
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
    return getPubSub().subscribe(channelNames, socketId)
  }
}
