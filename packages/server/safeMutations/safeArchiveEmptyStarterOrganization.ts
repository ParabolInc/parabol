import getRethink from '../database/rethinkDriver'
import getTeamsByOrgIds from '../postgres/queries/getTeamsByOrgIds'

// Only does something if the organization is empty & not paid
// safeArchiveTeam & downgradeToStarter should be called before calling this

const safeArchiveEmptyStarterOrganization = async (orgId: string) => {
  const r = await getRethink()
  const now = new Date()
  const orgTeams = await getTeamsByOrgIds([orgId])
  const teamCountRemainingOnOldOrg = orgTeams.length

  if (teamCountRemainingOnOldOrg > 0) return
  const org = await r.table('Organization').get(orgId).run()
  if (org.tier !== 'starter') return

  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})
    .update({removedAt: now})
    .run()
}

export default safeArchiveEmptyStarterOrganization
