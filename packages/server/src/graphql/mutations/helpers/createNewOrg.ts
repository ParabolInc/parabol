import getRethink from '../../../database/rethinkDriver'
import {OrgUserRole, TierEnum} from 'parabol-client/src/types/graphql'
import Organization from '../../../database/types/Organization'
import OrganizationUser from '../../../database/types/OrganizationUser'

export default async function createNewOrg(orgId: string, orgName: string, leaderUserId: string) {
  const r = await getRethink()
  const org = new Organization({id: orgId, tier: TierEnum.personal, name: orgName})
  const orgUser = new OrganizationUser({
    orgId,
    userId: leaderUserId,
    role: OrgUserRole.BILLING_LEADER
  })
  return r({
    org: r.table('Organization').insert(org),
    organizationUser: r.table('OrganizationUser').insert(orgUser)
  }).run()
}
