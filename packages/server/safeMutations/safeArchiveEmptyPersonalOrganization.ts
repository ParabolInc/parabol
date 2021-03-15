import getRethink from '../database/rethinkDriver'

// Only does something if the organization is empty & not paid
// safeArchiveTeam & downgradeToPersonal should be called before calling this

const safeArchiveEmptyPersonalOrganization = async (orgId: string) => {
  const r = await getRethink()
  const now = new Date()
  const teamCountRemainingOnOldOrg = (await r
    .table('Team')
    .getAll(orgId, {index: 'orgId'})
    .count()
    .run()) as number

  if (teamCountRemainingOnOldOrg > 0) return
  const org = await r
    .table('Organization')
    .get(orgId)
    .run()
  if (org.tier !== 'personal') return

  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})
    .update({removedAt: now})
    .run()
}

export default safeArchiveEmptyPersonalOrganization
