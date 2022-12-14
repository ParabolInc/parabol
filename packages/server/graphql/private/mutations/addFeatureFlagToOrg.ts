import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const addFeatureFlagToOrg: MutationResolvers['addFeatureFlagToOrg'] = async (
  _source,
  {orgIds, flag}
) => {
  const r = await getRethink()

  // RESOLUTION
  const updatedOrgIds = (await r
    .table('Organization')
    .getAll(r.args(orgIds))
    .update(
      {
        featureFlags: r.row('featureFlags').default([]).setInsert(flag)
      },
      {returnChanges: true}
    )('changes')('new_val')('id')
    .run()) as string[]

  return {updatedOrgIds}
}

export default addFeatureFlagToOrg
