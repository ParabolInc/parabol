import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getPubSub from '../../utils/getPubSub'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import TeamSubscriptionPayload from '../types/TeamSubscriptionPayload'

export default {
  type: new GraphQLNonNull(TeamSubscriptionPayload),
  subscribe: (_source, _args, {authToken}: GQLContext) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    const {tms: teamIds} = authToken
    const channelNames = teamIds.concat(userId).map((id) => `${SubscriptionChannel.TEAM}.${id}`)
    return getPubSub().subscribe(channelNames)
  }
}
