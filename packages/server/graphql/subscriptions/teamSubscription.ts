import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import getPubSub from '../../utils/getPubSub'
import {GQLContext} from '../graphql'
import TeamSubscriptionPayload from '../types/TeamSubscriptionPayload'

export default {
  type: new GraphQLNonNull(TeamSubscriptionPayload),
  subscribe: (_source: unknown, _args: unknown, {authToken, socketId}: GQLContext) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      throw new Error('Not authenticated')
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    const {tms: teamIds} = authToken
    const channelNames = teamIds.concat(userId).map((id) => `${SubscriptionChannel.TEAM}.${id}`)
    return getPubSub().subscribe(channelNames, socketId)
  }
}
