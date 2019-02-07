import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import TaskSubscriptionPayload from 'server/graphql/types/TaskSubscriptionPayload'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import {TASK} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

const taskSubscription = {
  type: new GraphQLNonNull(TaskSubscriptionPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const viewerId = getUserId(authToken)
    const channelName = `${TASK}.${viewerId}`
    const filterFn = ({mutatorId}) => mutatorId !== socketId
    const resolve = ({data}) => ({taskSubscription: data})
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}

export default taskSubscription
