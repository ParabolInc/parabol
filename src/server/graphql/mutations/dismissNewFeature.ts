import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import DismissNewFeaturePayload from '../types/DismissNewFeaturePayload'

export default {
  type: new GraphQLNonNull(DismissNewFeaturePayload),
  description: `Redeem an invitation token for a logged in user`,
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: async (_source, _args, {authToken}) => {
    const r = getRethink()

    // AUTH
    const viewerId = getUserId(authToken)

    await r
      .table('User')
      .get(viewerId)
      .update({
        newFeatureId: null
      })

    return {id: viewerId, newFeatureId: null}
  }
}
