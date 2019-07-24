import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from '../makeSubscribeIter'
import TeamSubscriptionPayload from '../types/TeamSubscriptionPayload'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import {TEAM} from '../../../client/utils/constants'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'

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
