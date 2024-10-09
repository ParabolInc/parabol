import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const addFeatureFlag: MutationResolvers['addFeatureFlag'] = async (
  _source,
  {featureName, description, expiresAt, scope}
) => {
  const pg = getKysely()

  const newFeatureFlag = await pg
    .insertInto('FeatureFlag')
    .values({
      featureName,
      description,
      expiresAt,
      scope
    })
    .returning('id')
    .executeTakeFirst()

  if (!newFeatureFlag) {
    return standardError(new Error('Failed to insert new feature flag'))
  }
  return {
    featureFlagId: newFeatureFlag.id
  }
}

export default addFeatureFlag
