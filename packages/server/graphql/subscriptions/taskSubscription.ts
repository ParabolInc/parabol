import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import TaskSubscriptionPayload from '../types/TaskSubscriptionPayload'
import makeStandardSubscription from './makeStandardSubscription'

const taskSubscription = {
  type: new GraphQLNonNull(TaskSubscriptionPayload),
  subscribe: async (_source, _args, {authToken, socketId, dataLoader}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${SubscriptionChannel.TASK}.${viewerId}`
    return makeStandardSubscription('taskSubscription', [channelName], socketId, dataLoader)
  }
}

export default taskSubscription
