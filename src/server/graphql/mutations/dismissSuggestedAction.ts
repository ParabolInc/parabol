import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId} from 'server/utils/authorization'
import {sendBadAuthTokenError} from 'server/utils/authorizationErrors'
import {sendSuggestedActionNotFoundError} from 'server/utils/docNotFoundErrors'
import DismissSuggestedActionPayload from '../types/DismissSuggestedActionPayload'

export default {
  type: new GraphQLNonNull(DismissSuggestedActionPayload),
  description: `Dismiss a suggested action`,
  args: {
    suggestedActionId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the suggested action to dismiss'
    }
  },
  resolve: async (_source, {suggestedActionId}, {authToken, dataLoader}) => {
    const r = getRethink()
    const now = new Date()

    // AUTH
    const suggestedAction = await dataLoader.get('suggestedActions').load(suggestedActionId)
    if (!suggestedAction) {
      return sendSuggestedActionNotFoundError(authToken, suggestedActionId)
    }
    const {userId} = suggestedAction
    const viewerId = getUserId(authToken)
    if (userId !== viewerId) return sendBadAuthTokenError()

    // RESOLUTION
    await r
      .table('SuggestedAction')
      .get(suggestedActionId)
      .update({removedAt: now})

    // no need to publish since that'll only affect their other open tabs
    return {
      userId,
      removedSuggestedActionId: suggestedActionId
    }
  }
}
