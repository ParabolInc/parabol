import getKysely from '../../../postgres/getKysely'
import standardError from '../../../utils/standardError'
import {QueryResolvers} from '../resolverTypes'

const getFeatureFlags: QueryResolvers['getFeatureFlags'] = async (
  _source,
  {userId, orgId, teamId}
) => {
  const providedIds = [userId, orgId, teamId].filter(Boolean)
  if (providedIds.length !== 1) {
    const error = new Error('Exactly one of userId, orgId, or teamId must be provided')
    return standardError(error)
  }

  const pg = getKysely()
  const query = pg
    .selectFrom('FeatureFlag as ff')
    .innerJoin('FeatureFlagOwner as ffo', 'ff.id', 'ffo.featureFlagId')
    .select(['ff.id'])

  if (userId) {
    query.where('ffo.userId', '=', userId)
  } else if (orgId) {
    query.where('ffo.orgId', '=', orgId)
  } else {
    query.where('ffo.teamId', '=', teamId!)
  }

  const featureFlags = await query.execute()
  const featureFlagIds = featureFlags.map((flag) => flag.id)

  return {featureFlagIds}
}

export default getFeatureFlags
