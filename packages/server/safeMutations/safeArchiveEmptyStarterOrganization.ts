import {sql} from 'kysely'
import {DataLoaderInstance} from '../dataloader/RootDataLoader'
import getKysely from '../postgres/getKysely'

// Only does something if the organization is empty & not paid
// safeArchiveTeam & downgradeToStarter should be called before calling this

const safeArchiveEmptyStarterOrganization = async (
  orgId: string,
  dataLoader: DataLoaderInstance
) => {
  const pg = getKysely()
  const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamCountRemainingOnOldOrg = orgTeams.length

  if (teamCountRemainingOnOldOrg > 0) return
  const org = await dataLoader.get('organizations').loadNonNull(orgId)
  if (org.tier !== 'starter') return
  await pg
    .updateTable('OrganizationUser')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .execute()
  dataLoader.clearAll('organizationUsers')
}

export default safeArchiveEmptyStarterOrganization
