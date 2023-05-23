import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const updateOrgFeatureFlag: MutationResolvers['updateOrgFeatureFlag'] = async (
  _source,
  {orgIds, flag, addFlag}
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
      (row) => ({
        featureFlags: r.branch(
          addFlag,
          row('featureFlags').default([]).setInsert(flag),
          row('featureFlags')
            .default([])
            .filter((featureFlag) => featureFlag.ne(flag))
        )
      }),
      {returnChanges: true}
    )('changes')('new_val')('id')
    .run()) as string[]

  return {updatedOrgIds}
}

export default updateOrgFeatureFlag
