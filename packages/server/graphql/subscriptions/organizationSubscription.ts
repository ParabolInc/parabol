import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from '../makeSubscribeIter'
import OrganizationSubscriptionPayload from '../types/OrganizationSubscriptionPayload'
import {getUserId} from '../../utils/authorization'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  type: new GraphQLNonNull(OrganizationSubscriptionPayload),
  subscribe: async (_source, _args, {authToken, dataLoader, socketId}) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const orgIds = organizationUsers
      .map(({orgId}) => orgId)

    // RESOLUTION
    const channelNames = orgIds.concat(viewerId).map((id) => `${SubscriptionChannel.ORGANIZATION}.${id}`)
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({organizationSubscription: data})
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve})
  }
}
