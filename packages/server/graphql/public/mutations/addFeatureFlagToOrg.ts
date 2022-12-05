import getRethink from '../../../database/rethinkDriver'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const addFeatureFlagToOrg: MutationResolvers['addFeatureFlagToOrg'] = async (
  _source,
  {orgIds, flag},
  {authToken}
) => {
  const r = await getRethink()

  // AUTH
  const viewerId = getUserId(authToken)

  if (!isSuperUser(authToken)) {
    return standardError(new Error('Not authorised to add feature flag'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  await r
    .table('Organization')
    .getAll(r.args(orgIds), {index: 'id'})
    .update({
      featureFlags: r.row('featureFlags').default([]).setInsert(flag)
    })
    .run()

  return {orgIds}
}

export default addFeatureFlagToOrg
