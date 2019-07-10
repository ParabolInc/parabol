import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import TeamSubscriptionPayload from 'server/graphql/types/TeamSubscriptionPayload'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import {TEAM} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'
import {GQLContext} from 'server/graphql/graphql'

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
    const channelNames = teamIds.concat(userId).map((id) => `${TEAM}.${id}`)
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({teamSubscription: data})
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve})
  }
}
