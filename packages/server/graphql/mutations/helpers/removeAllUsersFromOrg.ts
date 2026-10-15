import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'

const removeAllUsersFromOrg = async (orgId: string) => {
  const pg = getKysely()
  const removedOrganizationUsers = await pg
    .updateTable('OrganizationUser')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .returning('userId')
    .execute()
  if (removedOrganizationUsers.length === 0) return
  // best effort, like adjustUserCount: a missing audit row must not fail the removal above
  await pg
    .insertInto('OrganizationUserAudit')
    .values(
      removedOrganizationUsers.map(({userId}) => ({
        orgId,
        userId,
        eventDate: new Date(),
        eventType: 'removed' as const
      }))
    )
    .execute()
    .catch((e) =>
      Logger.error(`Failed to write OrganizationUserAudit removals for org ${orgId}`, e)
    )
}

export default removeAllUsersFromOrg
