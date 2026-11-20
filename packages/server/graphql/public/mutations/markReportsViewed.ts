import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const markReportsViewed: MutationResolvers['markReportsViewed'] = async (
  _source,
  {orgId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  await getKysely()
    .updateTable('OrganizationUser')
    .set({reportsViewedAt: sql`CURRENT_TIMESTAMP`})
    .where('userId', '=', viewerId)
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .execute()
  dataLoader.clearAll('organizationUsers')
  return {viewerId}
}

export default markReportsViewed
