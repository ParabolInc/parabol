import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const updateFeatureFlag: MutationResolvers['updateFeatureFlag'] = async (
  _source,
  {featureName, description, expiresAt}
) => {
  const pg = getKysely()

  const updatedFeatureFlag = await pg
    .updateTable('FeatureFlag')
    .set({
      description,
      expiresAt: expiresAt || undefined
    })
    .where('featureName', '=', featureName)
    .returning('id')
    .executeTakeFirst()

  if (!updatedFeatureFlag) {
    throw new Error('Feature flag not found')
  }

  return {
    featureFlagId: updatedFeatureFlag.id
  }
}

export default updateFeatureFlag
