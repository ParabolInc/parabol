import {GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import db from '../../db'
import {getUserId, requireSU} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddFeatureFlagPayload from '../types/AddFeatureFlagPayload'
import UserFlagEnum from '../types/UserFlagEnum'

export default {
  type: AddFeatureFlagPayload,
  description: 'Give someone advanced features in a flag',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: `the complete or partial email of the person to whom you are giving advanced features.
      Matches via a regex to support entire domains`
    },
    flag: {
      type: new GraphQLNonNull(UserFlagEnum),
      description: 'the flag that you want to give to the user'
    }
  },
  async resolve(_source, {email, flag}: {email: string; flag: string}, {authToken, dataLoader}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const users = await r
      .table('User')
      .filter((doc) => (doc as any)('email').match(email))
      .run()
    await db.prime('User', users)
    if (users.length === 0) {
      return standardError(new Error('Team member not found'), {userId: viewerId})
    }
    const reqlUpdater = (user) => ({
      featureFlags: user('featureFlags')
        .default([])
        .append(flag)
        .distinct()
    })
    const userIds = users.map(({id}) => id)
    await db.writeMany('User', userIds, reqlUpdater)
    const result = `${email} has been given access to the ${flag} feature. If the app is open, it should magically appear.`
    userIds.forEach((userId) => {
      const data = {result, userId}
      publish(SubscriptionChannel.NOTIFICATION, userId, 'AddFeatureFlagPayload', data, subOptions)
    })
    return {result, userIds}
  }
}
