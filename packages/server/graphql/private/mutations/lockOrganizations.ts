import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const lockOrganizations: MutationResolvers['lockOrganizations'] = async (
  _source,
  {orgIds, isPaid, message}
) => {
  const unpaidMessageHTML = !isPaid ? (message ?? null) : null

  // RESOLUTION
  const pg = getKysely()
  await pg
    .updateTable('Organization')
    .set({
      isPaid,
      unpaidMessageHTML
    })
    .where('id', 'in', orgIds)
    .execute()
  return true
}

export default lockOrganizations
