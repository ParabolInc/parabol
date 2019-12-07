import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId} from '../../utils/authorization'
import OrganizationSubscriptionPayload from '../types/OrganizationSubscriptionPayload'
import makeStandardSubscription from './makeStandardSubscription'

export default {
  type: new GraphQLNonNull(OrganizationSubscriptionPayload),
  subscribe: async (_source, _args, {authToken, dataLoader, socketId}) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const orgIds = organizationUsers.map(({orgId}) => orgId)

    // RESOLUTION
    const channelNames = orgIds
      .concat(viewerId)
      .map((id) => `${SubscriptionChannel.ORGANIZATION}.${id}`)
    return makeStandardSubscription('organizationSubscription', channelNames, socketId, dataLoader)
  }
}
