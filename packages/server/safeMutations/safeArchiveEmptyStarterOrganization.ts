import {sql} from 'kysely'
import getRethink from '../database/rethinkDriver'
import {DataLoaderInstance} from '../dataloader/RootDataLoader'
import getKysely from '../postgres/getKysely'
import getTeamsByOrgIds from '../postgres/queries/getTeamsByOrgIds'

// Only does something if the organization is empty & not paid
// safeArchiveTeam & downgradeToStarter should be called before calling this

const safeArchiveEmptyStarterOrganization = async (
  orgId: string,
  dataLoader: DataLoaderInstance
) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const orgTeams = await getTeamsByOrgIds([orgId])
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
  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})
    .update({removedAt: now})
    .run()
}

export default safeArchiveEmptyStarterOrganization
