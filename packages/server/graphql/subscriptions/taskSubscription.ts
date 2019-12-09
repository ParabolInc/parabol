import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getPubSub from '../../utils/getPubSub'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import TaskSubscriptionPayload from '../types/TaskSubscriptionPayload'

const taskSubscription = {
  type: new GraphQLNonNull(TaskSubscriptionPayload),
  subscribe: async (_source, _args, {authToken}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.TASK}.${viewerId}`
    return getPubSub().subscribe([channelName])
  }
}

export default taskSubscription
