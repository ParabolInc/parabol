import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const dismissNewFeature: MutationResolvers['dismissNewFeature'] = async (
  _source,
  _args,
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  await getKysely()
    .updateTable('User')
    .set({newFeatureId: null})
    .where('id', '=', viewerId)
    .execute()
  dataLoader.clearAll('users')
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  return {user: viewer}
}

export default dismissNewFeature
