import {GraphQLNonNull} from 'graphql'
import getKysely from '../../postgres/getKysely'
import {getUserId} from '../../utils/authorization'
import type {GQLContext} from '../graphql'
import DismissNewFeaturePayload from '../types/DismissNewFeaturePayload'

export default {
  type: new GraphQLNonNull(DismissNewFeaturePayload),
  description: `Redeem an invitation token for a logged in user`,
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: async (_source: unknown, _args: unknown, {authToken}: GQLContext) => {
    // AUTH
    const viewerId = getUserId(authToken)
    await getKysely()
      .updateTable('User')
      .set({newFeatureId: null})
      .where('id', '=', viewerId)
      .execute()
    return {}
  }
}
