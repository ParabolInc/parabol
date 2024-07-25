import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import isValid from '../../isValid'
import {MutationResolvers} from '../resolverTypes'

const updateOrgFeatureFlag: MutationResolvers['updateOrgFeatureFlag'] = async (
  _source,
  {orgIds, flag, addFlag},
  {dataLoader}
) => {
  const existingOrgs = (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)
  const existingIds = existingOrgs.map(({id}) => id)

  const nonExistingIds = orgIds.filter((x) => !existingIds.includes(x))

  if (nonExistingIds.length) {
    return {error: {message: `Organizations does not exists: ${nonExistingIds.join(', ')}`}}
  }

  // RESOLUTION
  const updatedOrgIds = await getKysely()
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

  return {updatedOrgIds: updatedOrgIds.map(({id}) => id)}
}

export default updateOrgFeatureFlag
