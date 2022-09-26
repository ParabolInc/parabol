import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import getPubSub from '../../utils/getPubSub'
import TaskSubscriptionPayload from '../types/TaskSubscriptionPayload'
import {GQLContext} from './../graphql'

const taskSubscription = {
  type: new GraphQLNonNull(TaskSubscriptionPayload),
  subscribe: async (_source: unknown, _args: unknown, {authToken}: GQLContext) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      throw new Error('Not authenticated')
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.TASK}.${viewerId}`
    return getPubSub().subscribe([channelName])
  }
}

export default taskSubscription
