import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
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
    throw new GraphQLError('Suggested action not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {userId} = suggestedAction
  if (userId !== viewerId) {
    throw new GraphQLError('Not authenticated', {extensions: {code: 'UNAUTHENTICATED'}})
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
