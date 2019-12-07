import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import TeamSubscriptionPayload from '../types/TeamSubscriptionPayload'
import makeStandardSubscription from './makeStandardSubscription'

export default {
  type: new GraphQLNonNull(TeamSubscriptionPayload),
  subscribe: (_source, _args, {authToken, dataLoader, socketId}: GQLContext) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    const {tms: teamIds} = authToken
    const channelNames = teamIds.concat(userId).map((id) => `${SubscriptionChannel.TEAM}.${id}`)
    return makeStandardSubscription('teamSubscription', channelNames, socketId, dataLoader)
  }
}
