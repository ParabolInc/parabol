import getKysely from '../../../postgres/getKysely'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const addFeatureFlag: MutationResolvers['addFeatureFlag'] = async (
  _source,
  {featureName, scope, description, expiresAt},
  {authToken}
) => {
  const pg = getKysely()

  // AUTH
  const viewerId = getUserId(authToken)
  if (!isSuperUser(authToken)) {
    return standardError(new Error('Not authorized to add feature flag'), {userId: viewerId})
  }

  try {
    const newFeatureFlag = await pg
      .insertInto('FeatureFlag')
      .values({
        featureName,
        scope,
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
  } catch (error) {
    console.error('Error adding feature flag:', error)
    return {
      featureFlag: null,
      error: {message: error instanceof Error ? error.message : 'An unknown error occurred'}
    }
  }
}

export default addFeatureFlag
