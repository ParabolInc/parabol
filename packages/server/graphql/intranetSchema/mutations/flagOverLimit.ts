import {GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import {GQLContext} from '../../graphql'
import FlagOverLimitPayload from '../../types/FlagOverLimitPayload'
import {requireSU} from '../../../utils/authorization'

const flagOverLimit = {
  type: FlagOverLimitPayload,
  description: 'add/remove a flag on a user saying they are over the free tier',
  args: {
    copy: {
      type: GraphQLString,
      description: 'The text body of the over limit message, null to remove the previous value'
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'the user email that went over the limit'
    }
  },
  resolve: async (_source, {copy, email}, {authToken}: GQLContext) => {
    const r = getRethink()

    // AUTH
    requireSU(authToken)

    // VALIDATION
    const user = await r
      .table('User')
      .getAll(email, {index: 'email'})
      .nth(0)
      .default(null)
    if (!user) return {error: {message: 'User does not exist'}}

    // RESOLUTION
    const {id: userId} = user
    await r
      .table('User')
      .get(userId)
      .update({
        overLimitCopy: copy || null
      })
    return {userId}
  }
}

export default flagOverLimit
