import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const deleteFeatureFlag: MutationResolvers['deleteFeatureFlag'] = async (
  _source,
  {featureName}
) => {
  const pg = getKysely()

  const deletedFeatureFlag = await pg
    .deleteFrom('FeatureFlag')
    .where('featureName', '=', featureName)
    .returning('id')
    .executeTakeFirst()

  if (!deletedFeatureFlag) {
    throw new Error('Feature flag not found')
  }

  return {
    featureFlagId: deletedFeatureFlag.id
  }
}

export default deleteFeatureFlag
