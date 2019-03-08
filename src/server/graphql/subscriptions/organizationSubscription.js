import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import OrganizationSubscriptionPayload from 'server/graphql/types/OrganizationSubscriptionPayload'
import {getUserId} from 'server/utils/authorization'
import {BILLING_LEADER, ORGANIZATION} from 'universal/utils/constants'

export default {
  type: new GraphQLNonNull(OrganizationSubscriptionPayload),
  subscribe: async (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const orgIds = organizationUsers
      .filter((organizationUser) => organizationUser.role === BILLING_LEADER)
      .map(({orgId}) => orgId)

    // RESOLUTION
    const channelNames = orgIds.concat(viewerId).map((id) => `${ORGANIZATION}.${id}`)
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({organizationSubscription: data})
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve})
  }
}
