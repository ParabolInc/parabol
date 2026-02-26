import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const dismissSuggestedAction: MutationResolvers['dismissSuggestedAction'] = async (
  _source,
  {suggestedActionId},
  {authToken, dataLoader}
) => {
  const now = new Date()
  const viewerId = getUserId(authToken)

  // AUTH
  const suggestedAction = await dataLoader.get('suggestedActions').load(suggestedActionId)
  if (!suggestedAction) {
    return standardError(new Error('Suggested action not found'), {userId: viewerId})
  }
  const {userId} = suggestedAction
  if (userId !== viewerId) {
    return standardError(new Error('Not authenticated'), {userId: viewerId})
  }

  // RESOLUTION
  await getKysely()
    .updateTable('SuggestedAction')
    .set({removedAt: now})
    .where('id', '=', suggestedActionId)
    .execute()

  return {userId, removedSuggestedActionId: suggestedActionId}
}

export default dismissSuggestedAction
