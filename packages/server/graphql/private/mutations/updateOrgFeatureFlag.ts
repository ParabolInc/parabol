import {sql} from 'kysely'
import {RValue} from 'rethinkdb-ts'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

const updateOrgFeatureFlag: MutationResolvers['updateOrgFeatureFlag'] = async (
  _source,
  {orgIds, flag, addFlag},
  {dataLoader}
) => {
  const r = await getRethink()
  const existingOrgs = (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)
  const existingIds = existingOrgs.map(({id}) => id)

  const nonExistingIds = orgIds.filter((x) => !existingIds.includes(x))

  if (nonExistingIds.length) {
    return {error: {message: `Organizations does not exists: ${nonExistingIds.join(', ')}`}}
  }

  // RESOLUTION
  await getKysely()
    .updateTable('Organization')
    .$if(addFlag, (db) => db.set({featureFlags: sql`arr_append_uniq("featureFlags",${flag})`}))
    .$if(!addFlag, (db) =>
      db.set({
        featureFlags: sql`ARRAY_REMOVE("featureFlags",${flag})`
      })
    )
    .where('id', 'in', orgIds)
    .returning('id')
    .execute()
  const updatedOrgIds = (await r
    .table('Organization')
    .getAll(r.args(orgIds))
    .update(
      (row: RValue) => ({
        featureFlags: r.branch(
          addFlag,
          row('featureFlags').default([]).setInsert(flag),
          row('featureFlags')
            .default([])
            .filter((featureFlag: RValue) => featureFlag.ne(flag))
        )
      }),
      {returnChanges: true}
    )('changes')('new_val')('id')
    .run()) as string[]

  return {updatedOrgIds}
}

export default updateOrgFeatureFlag
