import getRethink from '../database/rethinkDriver'
import {TierEnum} from 'parabol-client/types/graphql'

// Only does something if the organization is empty & not paid
// safeArchiveTeam & downgradeToPersonal should be called before calling this

const safeArchiveEmptyPersonalOrganization = async (orgId: string) => {
  const r = getRethink()
  const now = new Date()
  const teamCountRemainingOnOldOrg = (await r
    .table('Team')
    .getAll(orgId, {index: 'orgId'})
    .count()) as number

  if (teamCountRemainingOnOldOrg > 0) return
  const org = await r.table('Organization').get(orgId)
  if (org.tier !== TierEnum.personal) return

  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})
    .update({removedAt: now})
}

export default safeArchiveEmptyPersonalOrganization
