import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const dismissNewFeature: MutationResolvers['dismissNewFeature'] = async (
  _source,
  _args,
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  await getKysely()
    .updateTable('User')
    .set({newFeatureId: null})
    .where('id', '=', viewerId)
    .execute()
  return {}
}

export default dismissNewFeature
