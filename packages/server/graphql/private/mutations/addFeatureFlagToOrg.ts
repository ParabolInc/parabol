import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const addFeatureFlagToOrg: MutationResolvers['addFeatureFlagToOrg'] = async (
  _source,
  {orgIds, flag}
) => {
  const r = await getRethink()

  const existingIds = (await r.table('Organization').getAll(r.args(orgIds))('id').run()) as string[]

  const nonExistingIds = orgIds.filter((x) => !existingIds.includes(x))

  if (nonExistingIds.length) {
    return {error: {message: `Organizations does not exists: ${nonExistingIds.join(', ')}`}}
  }

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
