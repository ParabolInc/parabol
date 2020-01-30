import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import getPubSub from '../../utils/getPubSub'
import TaskSubscriptionPayload from '../types/TaskSubscriptionPayload'

const taskSubscription = {
  type: new GraphQLNonNull(TaskSubscriptionPayload),
  subscribe: async (_source, _args, {authToken}) => {
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
