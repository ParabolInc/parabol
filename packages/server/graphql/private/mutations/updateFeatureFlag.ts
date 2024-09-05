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
      expiresAt
    })
    .where('featureName', '=', featureName)
    .returningAll()
    .executeTakeFirst()

  if (!updatedFeatureFlag) {
    throw new Error('Feature flag not found')
  }

  return {
    featureFlag: updatedFeatureFlag
  }
}

export default updateFeatureFlag
