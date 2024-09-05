import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const addFeatureFlag: MutationResolvers['addFeatureFlag'] = async (
  _source,
  {featureName, description, expiresAt}
) => {
  const pg = getKysely()
  const newFeatureFlag = await pg
    .insertInto('FeatureFlag')
    .values({
      featureName,
      description,
      expiresAt
    })
    .returningAll()
    .executeTakeFirst()

  if (!newFeatureFlag) {
    throw new Error('Failed to insert new feature flag')
  }

  return {
    featureFlagId: newFeatureFlag.id
  }
}

export default addFeatureFlag
