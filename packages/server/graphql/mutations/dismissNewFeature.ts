import {GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import DismissNewFeaturePayload from '../types/DismissNewFeaturePayload'

export default {
  type: new GraphQLNonNull(DismissNewFeaturePayload),
  description: `Redeem an invitation token for a logged in user`,
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: async (_source, _args, {authToken}) => {
    const r = await getRethink()

    // AUTH
    const viewerId = getUserId(authToken)

    await r
      .table('User')
      .get(viewerId)
      .update({
        newFeatureId: null
      })
      .run()

    return {}
  }
}
